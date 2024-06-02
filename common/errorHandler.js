const { DEFAULT_ERROR_MESSAGE } = require("./constant");
const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  const message = err.message || DEFAULT_ERROR_MESSAGE;
  logger.error(`${message} - ${req.method} ${req.url} - ${err.stack}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
