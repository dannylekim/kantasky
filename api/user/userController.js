// ============ Initializations =============

"use strict";

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../utility/logUtil");

// ================ Functions ==================

/**
 * Tries to authenticate and verify the user with the credentials given
 *
 * @param {any} req has in the body a username and a password
 * @param {any} res goal is to return a token that has ID and role
 * @param {any} next moves on to the next handler
 */
exports.authenticate = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Login =============",
    ""
  );
  try {
    logger.log("info", "fieldChecks()", "Checking if fields are empty", "");
    const isNotEmpty = await fieldChecks(req, res, next); //checks if the fields are empty or not

    if (isNotEmpty) {
      logger.log(
        "info",
        "auth.verifyPassword",
        "Verify if the password is correct",
        ""
      );
      const user = await auth.verifyPassword(req.body); //verifies the hash and returns the user
      const token = createJsonToken(user); //returns a token that gives the id and role

      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successful Login =============",
        ""
      );
      res.json({ message: "Login Successful", token: token });
    }
  } catch (err) {
    next(err); //sends to next handler
  }
};
/**
 * Creates a JWT using the ID and Role as payload from the user object
 *
 * @param {any} user
 * @returns
 */
function createJsonToken(user) {
  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, config.secret, { expiresIn: "10h" });
  return token;
}

/**
 * Verifies that there are no empty fields
 *
 * @param {any} req has in the body a username and a password
 * @param {any} res
 * @param {any} next moves on to the next handler
 * @returns
 */
function fieldChecks(req, res, next) {
  return new Promise((resolve, reject) => {
    if (!req.body.username) {
      let err = errorHandler.createOperationalError(
        "Please input a username",
        401
      );
      reject(err);
      return;
    } else if (!req.body.password) {
      let err = errorHandler.createOperationalError(
        "Please input a password",
        401
      );
      err.status = 401;
      reject(err);
    } else {
      resolve(true);
    }
  });
}

//TODO: Verify email is a valid email
//set a user attribute Active: false
//create a hash with a reference to the user Id
//send an email to the supplied email address with a route
//when they hit the email -> checks the hash for the userId, and then sets the account to active

/**
 * Creates a user in the database
 *
 * @param {any} req has all the fields necessary
 * @param {any} res returns the newly created user
 * @param {any} next error handler
 */
exports.createUser = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Create User =============",
    ""
  );
  try {
    logger.log(
      "info",
      "auth.isPasswordValid()",
      "Checking if the password fulfills the requirements",
      ""
    );
    await auth.isPasswordValid(req.body.password);
    let foundUser = (await user.find({ username: req.body.username }))[0];

    //Finding user checks. If username or email already exists in the db, then reject
    if (foundUser) {
      const err = errorHandler.createOperationalError(
        "A user with this username already exists, please choose another one."
      );
      throw err;
    }
    foundUser = await user.findOne({ email: req.body.email });
    if (foundUser) {
      const err = errorHandler.createOperationalError(
        "This email is already in use!"
      );
      throw err;
    }

    //hash the password, save it into the database and then return the user without password or role
    logger.log("info", "bcrypt.hash()", "Hashing the password", "");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const newUser = new user(req.body);
    logger.log("info", "newUser.save()", "Creating User...", "");
    foundUser = await newUser.save();
    foundUser.password = undefined;
    foundUser.role = undefined;
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Created User =============",
      ""
    );
    res.json(foundUser);
  } catch (err) {
    next(err);
  }
};

/**
 * Updates a users first name, last name and email
 *
 * @param {any} req contains one of the above
 * @param {any} res
 * @param {any} next
 */
exports.updateAccountInformation = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Start Update Account Information =============",
    ""
  );
  //place new values into an object
  let updatedUser = {};
  if (req.body.firstName) updatedUser.firstName = req.body.firstName;
  if (req.body.lastName) updatedUser.lastName = req.body.lastName;
  if (req.body.email) updatedUser.email = req.body.email;

  try {
    //if all empty fields, reject
    if (!(updatedUser.firstName || updatedUser.lastName || updatedUser.email)) {
      const err = errorHandler.createOperationalError(
        "You need to change at least one thing!"
      );
      throw err;
    }

    let foundUser = await user.findOne({ _id: req.params.userId });

    //verify user is in db
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User is not found in the database",
        500
      );
      throw err;
    }

    logger.log("info", "foundUser.set()", "Setting new information", "");
    foundUser.set(updatedUser); //update the user

    logger.log("info", "foundUser.save()", "Updating the user", "");
    foundUser = await foundUser.save();
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully updated the Account =============",
      ""
    );
    res.json({ message: "Successfully updated the user's information." });
  } catch (err) {
    next(err);
  }
};

/**
 * Allows user to change password
 *
 * @param {any} req new password
 * @param {any} res returns success json
 * @param {any} next error Handler
 */
exports.changePassword = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Starting Change Password =============",
    ""
  );

  //check for empty
  if (!req.body.password) {
    const err = errorHandler.createOperationalError("Please input a password");
    throw err;
  }
  try {
    //check to see if properly valid and secure

    logger.log(
      "info",
      "auth.isPasswordValid()",
      "Checks the password if it fulfills the requirements",
      ""
    );

    await auth.isPasswordValid(req.body.password);
    let foundUser = await user.findOne({ _id: req.params.userId });

    //verify if in db
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "Use does not exist in the database",
        500
      );
      throw err;
    }

    //check if old password
    const isOldPassword = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );
    if (isOldPassword) {
      const err = errorHandler.createOperationalError(
        "Please input a new password"
      );
      throw err;
    }

    //set the new password
    logger.log("info", "bcrypt.hash()", "Hashing the password", "");
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    logger.log("info", "foundUser.set()", "Setting the password", "");
    foundUser.set({ password: hashedPassword });
    logger.log("info", "foundUser.save()", "Updating the user", "");
    await foundUser.save();
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully changed password =============",
      ""
    );
    res.json({ message: "Password has successfully been changed" });
  } catch (err) {
    next(error);
  }
};

//=============== Admin Functions ================
/**
 * Gets all the users. Requires Admin token.
 *
 * @param {any} req N/A
 * @param {any} res Returns all users
 */
exports.getAllUsers = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Starting Get All Users =============",
    ""
  );
  try {
    logger.log(
      "info",
      "auth.isAdmin()",
      "Check if requester is administrator",
      ""
    );
    await auth.isAdmin(req.get("authorization"));
    const foundUser = await user.find({});
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully got all users =============",
      ""
    );
    res.json(foundUser);
  } catch (err) {
    next(err);
  }
};

//TODO: Need to implement this to delete all tasks and groups...Actually do we need to really have this done
exports.deleteUser = async (req, res) => {
  try {
    await auth.isAdmin(req.get("authorization"));
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};
