// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");



//FIXME: THIS IS SUCH A HEAVY FUNCTION
exports.deleteGroup = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Delete Group =============",
      ""
    );
  
    try {
      const foundGroup = await group.findOne({ _id: req.params.groupId });
      if (!foundGroup)
        throw errorHandler.createOperationalError(
          "Group doesn't exist in database",
          500
        );
  
      const token = req.get("authorization").replace("Bearer ", "");
      const requesterId = auth.getIdFromToken(token);
  
      logger.log(
        "info",
        "Check if teamleader else auth.isAdmin()",
        "Checking if requester is administrator or team leader",
        ""
      );
      if (requesterId !== foundGroup.teamLeader.leaderId)
        await auth.isAdmin(token);
  
      logger.log(
        "info",
        "Looping, and user.find()",
        "Get every single user and task",
        ""
      );
      let usersList = [];
      let tasksList = [];
      for (let groupUser of foundGroup.users) {
        if (groupUser.userId !== "general") {
          usersList.push(groupUser.userId);
          tasksList.push(groupUser.taskId);
        }
      }
  
      const foundUsers = await user.find({ _id: { $in: usersList } });
      if (foundUsers.length !== usersList.length)
        throw errorHandler("Error in how many users in group vs database");
  
      logger.log(
        "info",
        ".splice() the group out of groupUser and save()",
        "Splicing and Updating all the groups",
        ""
      );
      for (let groupUser of foundUsers) {
        for (let index = 0; index < groupUser.groups.length; index++) {
          if (req.params.groupId === groupUser.groups[index].groupId) {
            groupUser.groups = groupUser.groups.splice(index, 1);
            await groupUser.save();
            break;
          }
        }
      }
  
      logger.log("info", "task.remove()", "Remove all Tasks", "");
      await task.remove({ _id: { $in: tasksList } });
      await group.remove({ _id: req.params.groupId });
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successfully Deleted Group =============",
        ""
      );
      res.json({ message: "Group has successfully been removed" });
    } catch (err) {
      next(err);
    }
  };