// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");

//TODO: Assign new team leader, remove groups from this user and move all user's tasks to general user. If last user, delete group.
exports.leaveGroup = async (req, res, next) => {
  try {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Leave Group =============",
      ""
    );

    logger.log("info", "auth.getIdFromToken", "Getting Id from the token", "");
    const token = req.get("authorization");
    const userId = auth.getIdFromToken(token);

    logger.log(
      "info",
      "group.findOne",
      "Trying to get group from the parameters",
      ""
    );
    let foundGroup = await group.findOne({ _id: req.params.groupId });
    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database!",
        500
      );
      throw err;
    }

    logger.log(
      "info",
      "users.find",
      "Trying to see if user belongs in the group",
      ""
    );
    //check that this user is actually in this group
    const isUserInGroup = foundGroup.users.find(user => {
      return user._id === userId;
    });

    if (!isUserInGroup) {
      const err = errorHandler.createOperationalError(
        "User can't leave group because user was never part of the group",
        403
      );
      throw err;
    }

    if (foundGroup.users.length === 1) {
      //TODO: delete the group
    }

    logger.log("info", "", "Trying to put in the new TeamLeader", "");

    //set new Team Leader
    if (
      !req.body.teamLeader ||
      !req.body.teamLeader.name ||
      !req.body.teamLeader.leaderId
    ) {
      const err = errorHandler.createOperationalError(
        "Need to assign a new teamLeader",
        403
      );
      throw err;
    }

    logger.log(
      "info",
      "Retrieve user...",
      "Check if user exists in database",
      ""
    );

    //remove group from this user
    let foundUser = user.findOne({ _id: userId });
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User doesn't exist in the database",
        403
      );
      throw err;
    }

    logger.log(
      "info",
      "Filter user/group",
      "Removing the user from group and vice versa",
      ""
    );

    const newUserGroups = foundUser.groups.filter(group => {
      return group.groupId !== foundGroup._id;
    });

    foundUser.groups = newUserGroups;

    //remove this user from this group
    const newGroupUsers = foundGroup.users.filter(user => {
      return user.userId !== userId;
    });

    foundGroup.users = newGroupUsers;

    //TODO: MAYBE:: all tasks by this user move to general user

    logger.log("info", "User.save, group.save", "Saving new changes...", "");
    foundUser = await foundUser.save();
    foundGroup = await foundGroup.save();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Finished Leave Group =============",
      ""
    );
    res.send(foundUser);
  } catch (err) {
    next(err);
  }
};
