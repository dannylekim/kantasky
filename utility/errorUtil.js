'use strict'

const logger = require("./logUtil");

const handleError = function handleError(err, req, res, next) {
  if (!err.isOperational) {
    logger.log('error', req.method + " " + res.url, '', err)
    res.send(err.message);
    process.exit(1);
  }
  if (err.status) {
    logger.log('warn', req.method + " " + res.url, err.status, err)
    res.status(err.status).send(err.message)
  }
  else {
    logger.log('warn', req.method + " " + res.url, '', err)
    res.send(err.message);
  }
};

const handleUncaughtException = function handleUncaughtException(err) {
  if (!err.isOperational) {
    logger.log('error', "UNCAUGHT EXCEPTION", "Non-Operational Error", err)
    console.log(err);
    process.exit(1);
  }

  logger.log('warn', "UNCAUGHT EXCEPTION", "Operational Error", err)
  throw err;
};

const createOperationalError = function createError(message, status) {
  var error = new Error(message);
  error.isOperational = true;
  error.status = status;
  return error;
};

exports.createOperationalError = createOperationalError;
exports.handleError = handleError;
exports.handleUncaughtException = handleUncaughtException;
