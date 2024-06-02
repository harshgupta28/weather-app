const { HttpStatusCode } = require("axios");
const moment = require("moment");

function dateXDaysOlder(daysOlder, format) {
  const date = new Date();
  date.setDate(date.getDate() - daysOlder);
  return moment(date).format(format);
}

function throwInvalidLocationError(id, res) {
  const errorMessage = `Location not found`;

  res.status(HttpStatusCode.BadRequest).json({ error: errorMessage });
  logger.error(` Location not found for id: ${id}`);

  throw new Error(errorMessage);
}

module.exports = {
  throwInvalidLocationError,
  dateXDaysOlder,
};
