"use strict";
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, colorize, prettyPrint } = format;
const fs = require("fs");

//Set to have a timestamp, pretty print and colorized (for console).
const logger = createLogger({
  format: combine(timestamp(), prettyPrint(), colorize()),
  transports: [new winston.transports.Console()]
});

let currentDate;

/**
 * Gets the current date, and creates a folder corresponding to the date. Then sets the transports of the logger to the appropriate filename.
 *
 * @param {any} next
 */
const setLoggerFileDestination = next => {
  const dateObj = getTodaysDate();
  if (currentDate !== dateObj.todayString) {
    createFolderHierarchyByDate(dateObj.month, dateObj.year, next);
    currentDate = dateObj.todayString;
    const combinedLogName =
      "../logs/" +
      dateObj.year +
      "/" +
      dateObj.month +
      "/" +
      todayString +
      "_daily.log";

    const errorLogName =
      "../logs/" +
      dateObj.year +
      "/" +
      dateObj.month +
      "/" +
      todayString +
      "_errors.log";

    const combinedLogTransport = new winston.transports.File({
      filename: combinedLogName,
      level: "warning" //logs everything warning and below to combinedLogName
    });

    const errorLogTransport = new winston.transports.File({
      filename: errorLogName,
      level: "error" //logs everything error and below to errorLogName
    });

    const consoleTransport = new winston.transports.Console()

    //should these be globals
    logger.clear()
    .add(combinedLogTransport)
    .add(errorLogTransport)
    .add(consoleTransport)
  }
};

/**
 * Creates the folders by year and month
 *
 * @param {any} month
 * @param {any} year
 * @param {any} next
 */
const createFolderHierarchyByDate = (month, year, next) => {
  try {
    fs.mkdir("../logs/" + year);
    fs.mkdir("../logs/" + year + "/" + month);
  } catch (err) {
    if (err.code !== "EEXIST") {
      next(err);
    }
  }
};

/**
 * Gets todays date and returns it in a wrapper object that has the date string, year, month, and day
 *
 * @returns
 */
const getTodaysDate = () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = "0" + month;
  }

  const todayString = year + month + day;
  const dateDataObj = {
    todayString: todayString,
    year: year,
    month: month,
    day: day
  };

  return dateDataObj;
};


const loggerHandler = (object, message, level, next) => {
  logger.log(level, message, object)
  next(object)
}