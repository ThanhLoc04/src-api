const config = require("./config.json");
const moment = require("moment-timezone");
const colors = require('colors');

module.exports = {
  error: message => console.log(`[${getCurrentTime()}] ${message}`.red),
  warn: message => console.log(`[${getCurrentTime()}] ${message}`.yellow),
  info: message => console.log(`[${getCurrentTime()}] ${message}`),
  load: message => console.log(`- Load: ${message}\n`.cyan),
  config: (message, status) => console.log(`- ${message}: ${status}\n`.cyan)
};

function getCurrentTime() {
  return moment.tz(config.timezone).format("HH:mm:ss");
}
