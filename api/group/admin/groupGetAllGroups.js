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
 * Admin route. Gets all the groups in the database.
 *
 * @param {any} req
 * @param {any} res
 */
exports.getAllGroups = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Get All Groups =============",
      ""
    );
    try {
      await auth.isAdmin(req.get("authorization"));
      const foundGroups = await group.find({});
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successfully Finished Get All Groups =============",
        ""
      );
      res.send(foundGroups);
    } catch (err) {
      next(err);
    }
  };
  