const moment = require("moment");
const mongoose = require("mongoose");

function dateXDaysOlder(daysOlder, format) {
  const date = new Date();
  date.setDate(date.getDate() - daysOlder);
  return moment(date).format(format);
}

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isPositiveInteger = (number) => {
  return Number.isInteger(number) && number > 0;
};

module.exports = { dateXDaysOlder, isValidObjectId };
