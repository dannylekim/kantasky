// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil"),
  { EMIT_CONSTANTS, emitChange } = require("../../../utility/socketUtil");

/**
 * Creates a group and adds the group to the user Id
 *
 * @param {any} req takes in Name, and Category type in body. Params must have userId
 * @param {any} res returns the new group
 * @param {any} next error handler
 */
exports.createGroup = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Create Group =============",
    ""
  );

  try {
    //initialize body and all necessary values
    let foundUser = await user.findOne({ _id: req.params.userId });
    //if user doesn't exist, return
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User does not exist in the database!",
        500
      );
      throw err;
    }

    logger.log(
      "info",
      "Group Creation",
      "Creating the group users and general user",
      ""
    );
    req.body.users = [{ userId: req.params.userId, taskId: [] }];
    if (req.body.category === "group")
      req.body.users.push({ userId: "general", taskId: [] });
    req.body.teamLeader = {
      leaderId: req.params.userId,
      name: foundUser.firstName + " " + foundUser.lastName
    };

    logger.log("info", "newGroup.save()", "Saving Group into the Database", "");
    //save the group to the database
    let newGroup = new group(req.body);
    newGroup = await newGroup.save();

    logger.log(
      "info",
      "foundUser.groups.push(), set(), save()",
      "Pushing the group onto the user and saving",
      ""
    );
    //push the group to the user
    const groupObj = {
      category: req.body.category,
      groupId: newGroup["_id"]
    };
    const updatedUser = foundUser.groups.push(groupObj);

    //set and save
    foundUser.set(updatedUser);
    foundUser = await foundUser.save();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Create Group =============",
      ""
    );
    res.json(newGroup);
    emitChange([req.params.userId], newGroup, EMIT_CONSTANTS.EMIT_GROUP_CREATE);
  } catch (err) {
    next(err);
  }
};
