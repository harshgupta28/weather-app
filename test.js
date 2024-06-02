// Get the current date
var currentDate = new Date();

// Set the time to midnight (00:00:00)
currentDate.setHours(0, 0, 0, 0);

// Get the epoch timestamp by dividing milliseconds by 1000
var epochTimestamp = Math.floor(currentDate.getTime() / 1000);

console.log(epochTimestamp);
