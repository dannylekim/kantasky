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