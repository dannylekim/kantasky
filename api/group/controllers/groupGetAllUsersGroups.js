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
exports.getAllUsersGroups = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Get All Users Groups =============",
    ""
  );
  try {
    const foundUser = await user.find({ _id: req.params.userId });

    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User does not exist in the database",
        500
      );
      throw err;
    }

    const groupIds = foundUser[0].groups.map(group => {
      return group.groupId
    });
    const usersGroups = await group.find({ _id: { $in: groupIds } }); //request for all groups

    if (!usersGroups) {
      const err = errorHandler.createOperationalError(
        "Error retrieving groups!",
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
    res.send(usersGroups);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};
