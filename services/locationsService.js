const axios = require("axios");
const logger = require("../common/logger");
const Location = require("../models/location");
const redisClient = require("../common/redisClient");
const { DEFAULT_COUNTRY_CODE } = require("../common/constant");
const InvalidLocationIdError = require("../common/invalidLocationError");
const InvalidPayloadError = require("../common/invalidPayLoad");
const { HttpStatusCode } = require("axios");
const { isValidObjectId } = require("../common/helper");

const getAllLocations = async () => {
  try {
    logger.info("Fetching all locations...");

    const cacheKey = "locations";
    const cachedLocations = await redisClient.get(cacheKey);

    if (cachedLocations) {
      return JSON.parse(cachedLocations);
    }

    const locations = await Location.find();

    await redisClient.setex(cacheKey, 600, JSON.stringify(locations)); // Cache for 10 minutes
    logger.info("All locations fetched successfully.");

    return locations;
  } catch (error) {
    logger.error(
      `Error occurred while fetching all locations: ${error.message}`
    );
    throw error;
  }
};

const addLocation = async (city) => {
  try {
    logger.info(`Adding Location: ${city}`);

    if (!city) {
      const errorMessage = "City not provided";
      logger.error(errorMessage);
      const error = new Error(errorMessage);
      error.statusCode = HttpStatusCode.BadRequest;
      throw error;
    }

    const countryCode = DEFAULT_COUNTRY_CODE;
    const limit = 1;

    const geoCodingUrl = `${process.env.OPEN_WEATHER_BASE_URL}/geo/1.0/direct?q=${city},${countryCode}&limit=${limit}&appid=${process.env.WEATHER_API_KEY}`;

    let response;

    try {
      response = await axios.get(geoCodingUrl);
      logger.info(`Successfully fetched data for location: ${city}`);
    } catch (error) {
      logger.error(
        `Failed to fetch data for location: ${city}, Error: ${error.message}`
      );
      throw error;
    }

    const firstCity = response.data[0];

    if (!firstCity) {
      const errorMessage = `Unable to find location: ${city}`;
      logger.error(errorMessage);
      const error = new Error(errorMessage);
      error.statusCode = HttpStatusCode.NoContent;

      throw error;
    }

    const newLocation = await Location.create({
      name: firstCity.name,
      latitude: firstCity.lat,
      longitude: firstCity.lon,
    });

    await redisClient.del("locations"); // Invalidate cache for locations
    logger.info(`Location added successfully: ${city}.`);

    return newLocation;
  } catch (error) {
    logger.error(`Error occurred while adding location: ${error.message}`);
    throw error;
  }
};

const getLocationById = async (id) => {
  try {
    logger.info(`Fetching location by Id: ${id}`);

    // payload sanity check
    if (!isValidObjectId(id)) {
      throw new InvalidPayloadError(id);
    }

    const cacheKey = `location:${id}`;
    const cachedLocation = await redisClient.get(cacheKey);

    if (cachedLocation) {
      return JSON.parse(cachedLocation);
    }

    const location = await Location.findById(id).exec();
    if (!location) {
      throw new InvalidLocationIdError(id);
    }

    await redisClient.setex(cacheKey, 600, JSON.stringify(location)); // Cache for 10 minutes
    logger.info(`Location fetched successfully for ID: ${id}`);

    return location;
  } catch (error) {
    logger.error(
      `Error occurred while fetching location by ID (${id}): ${error.message}`
    );
    throw error;
  }
};

const updateLocation = async (id, { name, latitude, longitude }) => {
  try {
    logger.info(`Updating location: ${id}`);

    // payload sanity check
    if (!isValidObjectId(id)) {
      throw new InvalidPayloadError(id);
    }

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      { name, latitude, longitude },
      { new: true }
    );

    if (!updatedLocation) {
      throw new InvalidLocationIdError(id);
    }

    const cacheKey = `location:${id}`;
    await redisClient.del(cacheKey);

    logger.info(`Location updated successfully: ${id}`);
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
    logger.info(`Deleting location: ${id}`);

    // payload sanity check
    if (!isValidObjectId(id)) {
      throw new InvalidPayloadError(id);
    }

    const isDeleted = await Location.findByIdAndDelete(id);

    if (!isDeleted) {
      throw new InvalidLocationIdError(id);
    }

    await redisClient.del(`location:${id}`); // Clear cache for deleted location
    await redisClient.del("locations"); // Clear cache for all locations

    logger.info(`Location deleted successfully: ${id}`);
  } catch (error) {
    logger.error(
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
