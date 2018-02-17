// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");

  /**
 * Gets the group specified by the param groupId
 *
 * @param {any} req
 * @param {any} res returns the found group
 * @param {any} next errorHandler
 */
exports.getGroup = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Get Group =============",
      ""
    );
    try {
      const foundGroup = await group.find({ _id: req.params.groupId });
  
      if (!foundGroup) {
        const err = errorHandler.createOperationalError(
          "Group does not exist in the database",
          500
        );
        throw err;
      }
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successfully Finished Get Group =============",
        ""
      );
      res.json(foundGroup);
    } catch (err) {
      err.isOperational = true;
      next(err);
    }
  };
  