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
exports.getUsersTask = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Starting Get User's Tasks =============",
      ""
    );
    try {
      //Check if the user exists
      let foundUser = await user.findOne({ _id: req.params.userId });
  
      //verify is not in db
      if (!foundUser) {
        const err = errorHandler.createOperationalError(
          "User does not exist in the database",
          500
        );
        throw err;
      }
  
      if (!foundUser.groups) {
        //check if has groups at all
        const err = errorHandler.createOperationalError(
          "User does not have any groups"
        );
        throw err;
      }
  
      logger.log(
        "info",
        "group.find()",
        "Create array of group Ids and push in to database call",
        ""
      );
      let groupIds = []; //pull all the ids
      for (let groups of foundUser.groups) {
        groupIds.push(groups.groupId);
      }
      let usersGroups = await group.find({ _id: { $in: groupIds } }); //request for all groups
      let usersTasks = [];
  
      logger.log(
        "info",
        "task.find()",
        "Going through each and every single one of users groups and concat to one array to find tasks",
        ""
      );
      //for each task in each single user where this user is, push into the users tasks
      for (let groupOfUser of usersGroups) {
        for (let groupUser of groupOfUser.users) {
          if (groupUser.userId === req.params.userId) {
            usersTasks = usersTasks.concat(groupUser.taskId);
          }
        }
      }
  
      //find all the tasks and send
      let allTasks = await task.find({ _id: { $in: usersTasks } });
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Finished Get User's Tasks =============",
        ""
      );
      res.send(allTasks);
    } catch (err) {
      next(err);
    }
  };
  