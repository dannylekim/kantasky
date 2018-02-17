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
 * Gets all the user's tasks in the specified group
 *
 * @param {any} res params are groupId and userId
 * @param {any} req returns all tasks
 * @param {any} next errorHandler
 */
exports.getUsersTasksInGroup = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Starting Get User's in Tasks Groups =============",
      ""
    );
  
    try {
      const foundGroup = await group.findOne({ _id: req.params.groupId });
      const requesterId = await auth.getIdFromToken(
        req.get("authorization").replace("Bearer ", "")
      );
  
      //verify if in db
      if (!foundGroup) {
        const err = errorHandler.createOperationalError(
          "Group does not exist in the database",
          500
        );
        throw err;
      }
  
      //find requester in the group
      let userInGroup = foundGroup.users.filter(obj => {
        return obj.userId === requesterId;
      });
  
      userInGroup = userInGroup[0];
  
      if (!userInGroup) {
        const err = errorHandler.createOperationalError(
          "Requester does not exist within the group"
        );
        throw err;
      }
  
      //find user in the group --> it's kinda like duplicate code. Find a way to merge above
      userInGroup = foundGroup.users.filter(obj => {
        return obj.userId === req.params.userId;
      });
  
      logger.log(
        "info",
        "task.find()",
        "Finding Tasks from that User in the group",
        ""
      );
      userInGroup = userInGroup[0];
  
      if (!userInGroup) {
        const err = errorHandler.createOperationalError(
          "User does not exist within the group"
        );
        throw err;
      }
  
      const allTasks = await task.find({ _id: { $in: userInGroup.taskId } });
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Finished Get User's in Tasks Groups =============",
        ""
      );
      res.send(allTasks);
    } catch (err) {
      next(err);
    }
  };