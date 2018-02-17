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
 * Creates a task inside the specified group
 *
 * @param {any} req parameters contain groupId and userId, body contains the task itself
 * @param {any} res returns the task
 * @param {any} next errorHandler
 * @returns
 */
exports.createTaskInGroup = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Starting Create Task In Group =============",
      ""
    );
    try {
      //verify both the group and user are valid
      let foundGroup = await group.findOne({ _id: req.params.groupId });
  
      if (!foundGroup) {
        const err = errorHandler.createOperationalError(
          "Group does not exist in the database",
          500
        );
        throw err;
      }
  
      //verify that the user is in the group
      let userInGroup = foundGroup.users.filter(user => {
        return user.userId === req.params.userId;
      });
  
      userInGroup = userInGroup[0];
  
      if (!userInGroup) {
        const err = errorHandler.createOperationalError(
          "There is no such user in this group!"
        );
        throw err;
      }
  
      //set ownership
      req.body.group = req.params.groupId;
      req.body.user = req.params.userId;
  
      //create task and save it to the database
      let newTask = new task(req.body);
  
      logger.log("info", "newTask.save()", "Saving into the database", "");
      newTask = await newTask.save();
  
      //add the task to the groupId specified
      userInGroup.taskId.push(newTask._id);
      foundGroup = await foundGroup.save();
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successfully Finished Created Task in Group =============",
        ""
      );
      res.send(newTask);
    } catch (err) {
      next(err);
    }
  };