const express = require("express");
const mongoose = require("mongoose");

const requestLogger = require("./common/requestLogger");
const errorHandler = require("./common/errorHandler");
const rateLimit = require("express-rate-limit");
const logger = require("./common/logger");

require("dotenv").config();

const app = express();
app.use(express.json());

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => logger.info("Database connected successfully: "))
  .catch((err) => logger.error("Database connection error: ", err));

// Define routes
const locationRoutes = require("./routes/locations");
const weatherRoutes = require("./routes/weather");

app.use("/locations", locationRoutes);
app.use("/weather", weatherRoutes);

// Register the errorHandler middleware as global error middleware
app.use(errorHandler);

// Use the request logger middleware
app.use(requestLogger);

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply the rate limiter to all requests
app.use(limiter);

const PORT = process.env.PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
