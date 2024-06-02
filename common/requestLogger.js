// requestLogger.js

const winston = require("winston");

// Configure Winston logger
const reqLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    // Add additional transports as needed, such as logging to a file
  ],
});

// Middleware function to log requests
function requestLogger(req, res, next) {
  reqLogger.info({
    message: "Incoming request",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  next();
}

module.exports = requestLogger;
