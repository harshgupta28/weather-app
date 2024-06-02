const { HttpStatusCode } = require("axios");
const logger = require("./logger");

class InvalidLocationIdError extends Error {
  constructor(id) {
    const message = `Location not found for id: ${id}`;

    super(message);
    logger.error(message);

    this.name = "InvalidLocationIdError";
    this.statusCode = HttpStatusCode.NotFound;
  }
}

module.exports = InvalidLocationIdError;
