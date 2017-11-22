const handleError = function handleError(err, req, res, next) {

  if (!err.isOperational) {
    //log
    res.send(err.message);
    process.exit(1);
  }
  if (err.status) res.status(status).send(err);
  else res.send(err.message);
};

const handleUncaughtException = function handleUncaughtException(err) {
  if (!err.isOperational) {
    //log
    console.log(err);
    process.exit(1);
  }
 
  throw err;
};

const createOperationalError = function createError(message, status, next) {
  var error = new Error(message);
  error.isOperational = true;
  error.status = status;
  return error
};

exports.createOperationalError = createOperationalError;
exports.handleError = handleError;
exports.handleUncaughtException = handleUncaughtException;
