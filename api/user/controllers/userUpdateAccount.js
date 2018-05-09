// ============ Initializations =============

("use strict");

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../../utility/logUtil"),
  { emitChange, EMIT_CONSTANTS } = require("../../../utility/socketUtil");

//===============================================

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
  if (req.body.notifications)
    updatedUser.notifications = req.body.notifications;

  try {
    //if all empty fields, reject
    if (
      !(
        updatedUser.firstName ||
        updatedUser.lastName ||
        updatedUser.email ||
        req.body.notifications
      )
    ) {
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

    foundUser.password = undefined;
    foundUser.role = undefined;
    res.send(foundUser);
    emitChange(req.params.userId, foundUser, EMIT_CONSTANTS.EMIT_USER_UPDATE);
  } catch (err) {
    next(err);
  }
};
