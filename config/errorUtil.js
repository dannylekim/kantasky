const handleError = function handleError(err, req, res, next) { 
    if(!err.isOperational){
        //log
        res.send(err)
        process.exit(1)
    }
    res.send(err)
}

const handleUncaughtException = function handleUncaughtException(err) { 
    if(!err.isOperational){
        //log
        console.log(err)
        process.exit(1)
    }
    throw err
}

const createOperationalError = function createError(message) { 
    var error = new Error(message)
    error.isOperational = true 
    next(error)
}

exports.createOperationalError = createOperationalError;
exports.handleError = handleError;
exports.handleUncaughtException = handleUncaughtException;