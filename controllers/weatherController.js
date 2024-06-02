const { HttpStatusCode } = require("axios");
const weatherService = require("../services/weatherService");

exports.getWeatherByLocationId = async (req, res, next) => {
  try {
    const weatherData = await weatherService.getWeatherByLocationId(
      req.params.id
    );
    res.status(HttpStatusCode.Ok).json(weatherData);
  } catch (error) {
    next();
  }
};

exports.weatherHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { summaryDays } = req.query;

    const weatherHistory = await weatherService.getWeatherHistory(
      id,
      summaryDays,
      res
    );
    res.status(HttpStatusCode.Ok).json(weatherHistory);
  } catch (error) {
    next();
  }
};
