"use strict";
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint, label, printf } = format;
const fs = require("fs");

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message} ${info.meta}`;
});

//Set to have a timestamp, pretty print and colorized (for console).
const logger = createLogger({
  format: combine(label({ label: "right meow!" }), timestamp(), prettyPrint()),
  transports: [new transports.Console()]
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
      level: "warn" //logs everything warning and below to combinedLogName
    });

    const errorLogTransport = new transports.File({
      name: "errorLog",
      filename: errorLogName,
      level: "error" //logs everything error and below to errorLogName
    });

    const consoleTransport = new transports.Console();

    //should these be globals
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
const createFolderHierarchyByDate = (month, year, next) => {
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
  const day = today.getDate();
  const month = today.getMonth() + 1;
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

exports.loggerHandler = (req, res, next) => {
  setLoggerFileDestination(next);
  const level = req.log.level;
  const message = req.log.message;
  const object = req.log.object;
  logger.log({ level: level, message: message, meta: object });
  req.log = undefined;

  if (level === "error") next(object);
  return;
};
