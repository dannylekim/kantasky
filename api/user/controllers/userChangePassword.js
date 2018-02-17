// ============ Initializations =============

("use strict");

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../../utility/logUtil");


//===============================================

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
    next(err);
  }
};