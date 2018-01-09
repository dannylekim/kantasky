/* 
Levels goes as follows for logging: 

Error: 0 
Warn: 1 
info: 2
verbose: 3
debug: 4
silly: 5

It's up to the programmer to write logs at the appropriate level. Level 5 is the most verbose. Log levels should be read from a config file. 


*/


"use strict";
const { createLogger, format, transports } = require("winston");
const { combine, printf } = format;
const fs = require("fs"),
  moment = require("moment"),
  logLevel = require("../config/config").logLevel

//set up my format to be as such Date | LEVEL | METHOD url | [label]: message | err.stack
const myFormat = printf(info => {
  return (
    `[${info.timestamp}] | ${info.level.toUpperCase()} | ${info.label} : ${info.message} ${info.err}`
  );
});

//Set to have a timestamp, pretty print and colorized (for console).
const logger = createLogger({
  format: myFormat,
  transports: [new transports.Console()]
});

let currentDate;

/**
 * Gets the current date, and creates a folder corresponding to the date. Then sets the transports of the logger to the appropriate filename.
 *
 * @param {any}
 */
const setLoggerFileDestination = () => {
  const dateObj = getTodaysDate();
  if (currentDate !== dateObj.todayString) {
    createFolderHierarchyByDate(dateObj.month, dateObj.year);
    currentDate = dateObj.todayString;

    //create the log names and then create the transports using those names
    const combinedLogName =
      "./logs/" +
      dateObj.year +
      "/" +
      dateObj.month +
      "/" +
      dateObj.todayString +
      "_daily.log";

    const errorLogName =
      "./logs/" +
      dateObj.year +
      "/" +
      dateObj.month +
      "/" +
      dateObj.todayString +
      "_errors.log";


  
    const combinedLogTransport = new transports.File({
      name: "dailyLog",
      filename: combinedLogName,
      level: logLevel //logs everything info and below to combinedLogName
    });

    const errorLogTransport = new transports.File({
      name: "errorLog",
      filename: errorLogName,
      level: "error" //logs only errors
    });

    const consoleTransport = new transports.Console();

    //remove and add them to the logger
    logger
      .remove("dailyLog")
      .remove("errorLog")
      .add(combinedLogTransport)
      .add(errorLogTransport);
  }
};

/**
 * Creates the folders by year and month
 *
 * @param {any} month
 * @param {any} year
 * @param {any} next
 */
const createFolderHierarchyByDate = (month, year) => {
  //check if exists, if not create dir
  if (!fs.existsSync("./logs")) fs.mkdir("./logs");
  if (!fs.existsSync("./logs/" + year)) fs.mkdirSync("./logs/" + year);
  if (!fs.existsSync("./logs/" + year + "/" + month))
    fs.mkdirSync("./logs/" + year + "/" + month);
};

/**
 * Gets todays date and returns it in a wrapper object that has the date string, year, month, and day
 *
 * @returns
 */
const getTodaysDate = () => {
  const today = new Date();
  let day = today.getDate();
  let month = today.getMonth() + 1;
  const year = today.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  const todayString = year + "" + "" + month + "" + day;
  const dateDataObj = {
    todayString: todayString,
    year: year,
    month: month,
    day: day
  };

  return dateDataObj;
};

/**
 * Middleware to just configure the file destinations and set the logger up
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.loggerMiddleware = (req, res, next) => {
  setLoggerFileDestination(next);
  next();
};

/**
 * Create a log inside the .log file that's corresponding to the level. Everything goes into daily, error goes into error logs as well.
 *
 * @param {any} level the level in lower case of the log. Could be: info, warn, err, debug, silly
 * @param {any} label The label: generally put either the req.method + " " + req.url OR the method name if not a request.
 * @param {any} message the message that you'd like to place.
 * @param {any} err the error obj. You could also just not fill it out.
 */
exports.log = (level, label, message, err) => {
  const time = moment().format("MMMM Do YYYY, h:mm:ss a");

  //create the log object
  let logObj = {
    level: level,
    message: message,
    label: label,
    timestamp: time
  };

  if (!err || err === "") logObj.err = "";
  else logObj.err = err.stack;

  logger.log(logObj);
};
