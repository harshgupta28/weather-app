const express = require("express");
const router = express.Router();
const locationsController = require("../controllers/locationsController");

router.get("/", locationsController.getAllLocations);
router.post("/", locationsController.addLocation);
router.get("/:id", locationsController.getLocationById);
router.put("/:id", locationsController.updateLocation);
router.delete("/:id", locationsController.deleteLocation);

module.exports = router;
