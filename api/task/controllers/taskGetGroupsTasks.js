// ============== Initializations ===============

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");


  //FIXME: very heavy function. Rethink this when you can because it is a triple database call with a triple nested for loop
/**
 * Get's all of the users tasks in every single group in an array. Requires token
 *
 * @param {any} req needs userId
 * @param {any} res returns array of objects
 * @param {any} next errorHandler
 */
exports.getGroupsTasks = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Starting Get Groups' Tasks =============",
      ""
    );
    try {
  
        //TODO: Verify that the requester has access to this group
      const groupId = req.params.groupId
  
      //find all the tasks and send
      let allTasks = await task.find({ group: groupId });
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Finished Get Groups' Tasks =============",
        ""
      );
      res.send(allTasks);
    } catch (err) {
      next(err);
    }
  };
  