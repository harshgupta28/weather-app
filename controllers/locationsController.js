const { HttpStatusCode } = require("axios");
const {
  addLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} = require("../services/locationsService");

exports.getAllLocations = async (req, res) => {
  try {
    const locations = await getAllLocations();
    res.status(HttpStatusCode.Ok).json(locations);
  } catch (error) {
    next(err);
  }
};

exports.addLocation = async (req, res, next) => {
  try {
    const { city } = req.body;
    const newLocation = await addLocation(city);
    res.status(HttpStatusCode.Created).json(newLocation);
  } catch (err) {
    next(err);
  }
};

exports.getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const location = await getLocationById(id, res);
    res.status(HttpStatusCode.Ok).json(location);
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedLocation = await updateLocation(id, req.body);
    res.status(HttpStatusCode.Ok).json(updatedLocation);
  } catch (err) {
    next(err);
  }
};

exports.deleteLocation = async (req, res, next) => {
  try {
    await deleteLocation(req.params.id);
    res.status(HttpStatusCode.NoContent).end();
  } catch (err) {
    next(err);
  }
};
