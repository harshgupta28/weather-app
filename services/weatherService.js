const axios = require("axios");
const Location = require("../models/location");
const redisClient = require("../common/redisClient");
const logger = require("../common/logger");
const { dateXDaysOlder, isValidObjectId } = require("../common/helper");
const InvalidLocationIdError = require("../common/invalidLocationError");
const InvalidPayloadError = require("../common/invalidPayLoad");

const getWeatherByLocationId = async (id) => {
  logger.info(`Fetching weather for location id: ${id}`);

  // payload sanity check
  if (!isValidObjectId(id)) {
    throw new InvalidPayloadError(id);
  }

  const cacheKey = `weather:${id}`;
  const cachedWeather = await redisClient.get(cacheKey);

  if (cachedWeather) {
    return JSON.parse(cachedWeather);
  }

  const location = await Location.findById(id);

  if (!location) {
    throw new InvalidLocationIdError(id);
  }

  const weatherUrl = `${process.env.OPEN_WEATHER_BASE_URL}/data/3.0/onecall?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WEATHER_API_KEY}`;
  let response;

  try {
    response = await axios.get(weatherUrl);
    logger.info(
      `Successfully fetched weather data for url: ${weatherUrl}, response: ${response}`
    );
  } catch (error) {
    logger.error(
      `Failed to fetch weather data for url: ${weatherUrl}, error: ${error}`
    );
    throw error;
  }

  const weatherData = response.data;

  await redisClient.setex(cacheKey, 600, JSON.stringify(weatherData));

  logger.error(`Fetched weather data for id: ${id}`);

  return weatherData;
};

const getWeatherHistory = async (id, summaryDays) => {
  logger.info(
    `Fetching weather history for location id: ${id} for last ${summaryDays} days`
  );

  // payload sanity check
  if (!isValidObjectId(id) || isPositiveInteger(summaryDays)) {
    throw new InvalidPayloadError({ id, summaryDays });
  }

  const location = await Location.findById(id);

  if (!location) {
    throw new InvalidLocationIdError(id);
  }

  const summaryPromises = [];
  const summary = [];

  for (let i = 0; i < summaryDays; i++) {
    summaryPromises.push(
      new Promise(async (resolve, reject) => {
        const date = dateXDaysOlder(i, "YYYY-MM-DD");
        const weatherHistoryUrl = `${process.env.OPEN_WEATHER_BASE_URL}/data/3.0/onecall/day_summary?lat=${location.latitude}&lon=${location.longitude}&date=${date}&appid=${process.env.WEATHER_API_KEY}`;

        try {
          const cacheKey = `weatherHistory:${id}:${date}`;
          const cachedHistory = await redisClient.get(cacheKey);

          if (cachedHistory) {
            summary.push(JSON.parse(cachedHistory));
          } else {
            const response = await axios.get(weatherHistoryUrl);

            logger.info(
              `Successfully fetched weather history for url: ${weatherHistoryUrl}, response: ${response}`
            );

            const historyData = response.data;

            // Cache the history data for 10 minutes
            await redisClient.setex(cacheKey, 600, JSON.stringify(historyData));
            summary.push(historyData);
          }
          resolve();
        } catch (error) {
          logger.error(
            `Failed to fetch weather history for url: ${weatherHistoryUrl}, error: ${error}`
          );
          reject(error);
        }
      })
    );
  }

  try {
    await Promise.all(summaryPromises);
    logger.error(`Fetched weather history for id: ${id}`);
    return summary;
  } catch (error) {
    console.error("Error occurred during fetching weather history:", error);
    throw error;
  }
};

module.exports = {
  getWeatherByLocationId,
  getWeatherHistory,
};
