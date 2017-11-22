const userModel = require("mongoose").model("User"),
  jwt = require("jsonwebtoken"),
  errorHandler = require("./errorUtil");

//================= Verification ===================

exports.verifyPassword = async userData => {
  try {
    const user = await userModel.findOne({ username: userData.username });
    if (!user) {
      const err = errorHandler.createOperationalError(
        "User has not been found"
      );
      return Promise.reject(err);
    } else {
      await user.isPasswordValid(userData.password);
      return Promise.resolve(user);
    }
  } catch (e) {
    e.isOperational = true;
    return Promise.reject(e);
  }
};

//================= Used for local passport strategy =============
exports.getUser = function findUserById(userId, callback) {
  userModel.findById(userId, (err, user) => {
    if (err) {
      err.isOperational = true;
      callback(err);
    } else {
      callback(null, user);
    }
  });
};

//================= Authorization =============================

exports.isAdmin = function(token, callback) {
  token = token.replace("Bearer ", "");
  const user = jwt.decode(token);
  if (user.role[0] !== "admin") {
    var error = errorHandler.createOperationalError(
      "Access denied. User has no admin privileges."
    );
    callback(error);
  } else {
    callback(null, true);
  }
};

exports.isPasswordValid = function checkValidity(password) {
  let isPasswordValid = true;
  //parse password
  if (password > 160) isPasswordValid = false;
  if (!/\d/.test(password)) isPasswordValid = false;
  if (!/[a-z]/.test(password)) isPasswordValid = false;
  if (!/[A-Z]/.test(password)) isPasswordValid = false;
  if (/[^0-9a-zA-Z]/.test(password)) isPasswordValid = false;

  return isPasswordValid;
};

//================ Decode =========================

exports.getIdFromToken = function decodeToken(token) {
  return jwt.decode(token).id;
};
