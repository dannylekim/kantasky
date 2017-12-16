"use strict";

const logger = require("./logUtil");

/**
 *  Error Handling Middleware. Checks if operational, checks if there's a status and sends a response appropriately
 * logs as well
 *
 * @param {any} err Error
 * @param {any} req Request
 * @param {any} res Response
 * @param {any} next Next
 */
exports.handleError = (err, req, res, next) => {
  
  let errorObj = {
    label: req.method + " " + res.url,
    message: "",
    err: err,
    level: "warn"
  };
  if (!err.isOperational) errorObj.level = "error";

  if (err.status) {
    errorObj.message = err.status;
    res.status(err.status);
  }

  logger.log(errorObj);
  res.send(err.message);
};

/**
 *  Unhandled exception. If non operational, exit
 *
 * @param {any} err error   wd
 */
exports.handleUncaughtException = err => {
  if (!err.isOperational) {
    logger.log("error", "UNCAUGHT EXCEPTION", "Non-Operational Error", err);
    process.exit(1);
  }

  logger.log("warn", "UNCAUGHT EXCEPTION", "Operational Error", err);
  throw err;
};

/**
 * Creates an operational error with the message
 *
 * @param {any} message message of the error
 * @param {any} status http status code
 * @returns
 */
exports.createOperationalError = (message, status) => {
  let error = new Error(message);
  error.isOperational = true;
  if (status) error.status = status;
  return error;
};
