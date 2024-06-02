const { HttpStatusCode } = require("axios");
const logger = require("./logger");

class InvalidPayload extends Error {
  constructor(payload) {
    const message = `Invalid Payload: ${payload}`;

    super(message);
    logger.error(message);

    this.name = "InvalidPayload";
    this.statusCode = HttpStatusCode.BadRequest;
  }
}

module.exports = InvalidPayload;
