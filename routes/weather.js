const express = require("express");
const router = express.Router();
const weatherController = require("../controllers/weatherController");

router.get("/:id", weatherController.getWeatherByLocationId);
router.get("/history/:id", weatherController.weatherHistory);

module.exports = router;
