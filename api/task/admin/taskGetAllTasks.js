// ============== Initializations ===============

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");

/**
 *  Admin route. Gets all the tasks in the database.
 *
 * @param {any} req
 * @param {any} res Returns all tasks
 * @param {any} next Error Handler
 */
exports.getAllTasks = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Get All Tasks =============",
      ""
    );
    try {
      await auth.isAdmin(req.get("authorization"));
      const foundTask = await task.find({});
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successfully Finished Get All Tasks =============",
        ""
      );
      res.json(foundTask);
    } catch (err) {
  
      next(err);
    }
  };
  