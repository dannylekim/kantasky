const userModel = require("mongoose").model("User"),
  jwt = require("jsonwebtoken"),
  errorHandler = require("./errorUtil");

//================= Verification ===================

/**
 * Verifies the password by searching for the user and checking the hash
 *
 * @param {any} userData
 * @returns
 */
exports.verifyPassword = async userData => {
  try {
    let user = await userModel.findOne({ username: userData.username }); //database call for finding user
    if(!user) user = await userModel.findOne({email: userData.username}) //another db call to see check the email
    if (!user) {  
      let err = errorHandler.createOperationalError(
        "User has not been found",
        401
      );
      return Promise.reject(err);
    } else {
      await user.isPasswordValid(userData.password);
      return Promise.resolve(user);
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

//================= Used for local passport strategy =============
exports.getUser = (userId, callback) => {
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
/**
 * Checks the token for admin privileges
 * 
 * @param {any} token has the ID and Role
 * @returns error or resolve
 */
exports.isAdmin = (token) => {
  return new Promise((resolve, reject) => {
    token = token.replace("Bearer ", "");
    const user = jwt.decode(token); //decodes the token
    if (user.role[0] !== "admin") {
      const error = errorHandler.createOperationalError(
        "Access denied. User has no admin privileges.",
        403
      );
      return reject(error);
    }
    return resolve();
  });
};

/**
 * Checks for number of characters, alphanumeric and case sensitive in the passwords.
 *
 * @param {any} password the password
 * @returns returns control back to the caller
 */
exports.isPasswordValid = (password) => {
  return new Promise((resolve, reject) => {
    if (password > 160)
      return reject(
        errorHandler.createOperationalError(
          "Too many characters. Password must not be over 160 characters"
        )
      );
    if (!/\d/.test(password))
      return reject(
        errorHandler.createOperationalError(
          "Password must contain at least a numeric character."
        )
      );
    if (!/[a-z]/.test(password))
      return reject(
        errorHandler.createOperationalError(
          "Password must contain at least a lower case character."
        )
      );
    if (!/[A-Z]/.test(password))
      return reject(
        errorHandler.createOperationalError(
          "Password must contain at least an upper case character."
        )
      );
    if (!/[^0-9a-zA-Z]/.test(password))
      return reject(
        errorHandler.createOperationalError(
          "Password must contain at least a symbol character."
        )
      );
    return resolve();
  });
};

//================ Decode =========================

exports.getIdFromToken = (token) => {
  return jwt.decode(token).id;
};
