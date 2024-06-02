const axios = require("axios");
const logger = require("../common/logger");
const Location = require("../models/location");
const redisClient = require("../common/redisClient");
const { DEFAULT_COUNTRY_CODE } = require("../common/constant");

const getAllLocations = async () => {
  try {
    const cacheKey = "locations";
    const cachedLocations = await redisClient.get(cacheKey);

    if (cachedLocations) {
      return JSON.parse(cachedLocations);
    }

    const locations = await Location.find();

    await redisClient.setex(cacheKey, 600, JSON.stringify(locations)); // Cache for 10 minutes
    return locations;
  } catch (error) {
    console.error(
      `Error occurred while fetching all locations: ${error.message}`
    );
    throw error;
  }
};

const addLocation = async (city) => {
  try {
    logger.info(`Adding Location: ${city}`);

    // basic sanity
    if (!city) {
      throw new Error("City not provided");
    }

    const countryCode = DEFAULT_COUNTRY_CODE;
    const limit = 1;

    const geoCodingUrl = `${process.env.OPEN_WEATHER_BASE_URL}/geo/1.0/direct?q=${city},${countryCode}&limit=${limit}&appid=${process.env.WEATHER_API_KEY}`;

    let response;

    try {
      response = await axios.get(geoCodingUrl);
      logger.info(
        `Successfully fetched data for location. Location: ${city}, url: ${geoCodingUrl}, response: ${response}`
      );
    } catch (error) {
      logger.error(
        `Failed to fetch data for location. Location: ${city}, url: ${geoCodingUrl}, error: ${error}`
      );
      throw error;
    }

    const firstCity = response.data[0];

    if (!firstCity) {
      const message = `Unable to find location: ${city}`;
      logger.info(message);
      return { message };
    }

    const newLocation = await Location.create({
      name: firstCity.name,
      latitude: firstCity.lat,
      longitude: firstCity.lon,
    });

    // Invalidate cache for locations since we've added a new one
    await redisClient.del("locations");

    logger.info(`Location added successfully: :${city}`);

    return newLocation;
  } catch (error) {
    logger.error(`Error occurred while adding location: ${error.message}`);
    throw error;
  }
};

const getLocationById = async (id, res) => {
  try {
    const cacheKey = `location:${id}`;
    const cachedLocation = await redisClient.get(cacheKey);

    if (cachedLocation) {
      return JSON.parse(cachedLocation);
    }

    const location = await Location.findById(id).exec();
    if (!location) {
      const errorMessage = "Location not found";
      res.status(axios.HttpStatusCode.BadRequest).json({ error: errorMessage });
      throw new Error(errorMessage);
    }

    await redisClient.setex(cacheKey, 600, JSON.stringify(location)); // Cache for 10 minutes
    return location;
  } catch (error) {
    console.error(
      `Error occurred while fetching location by ID (${id}): ${error.message}`
    );
    throw error;
  }
};

const updateLocation = async (id, { name, latitude, longitude }) => {
  try {
    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude },
      { new: true }
    );

    // Update the cache
    const cacheKey = `location:${id}`;
    await redisClient.setex(cacheKey, 600, JSON.stringify(updatedLocation)); // Cache for 10 minutes

    return updatedLocation;
  } catch (error) {
    logger.error(
      `Error occurred while updating location (${id}): ${error.message}`
    );
    throw error;
  }
};

const deleteLocation = async (id) => {
  try {
    await Location.findByIdAndDelete(id);

    // Clear the cache for the deleted location and all locations
    await redisClient.del(`location:${id}`);
    await redisClient.del("locations");
  } catch (error) {
    console.error(
      `Error occurred while deleting location (${id}): ${error.message}`
    );
    throw error;
  }
};

module.exports = {
  addLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
