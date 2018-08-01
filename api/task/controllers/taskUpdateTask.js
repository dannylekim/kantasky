// ============== Initializations ===============

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil"),
  { emitChange, EMIT_CONSTANTS } = require("../../../utility/socketUtil");

//TODO: Test
/**
 * Updates the task.
 *
 * @param {any} req parameters take taskId
 * @param {any} res
 * @param {any} next
 */
exports.updateTask = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Update Task =============",
    ""
  );

  try {
    //TODO: At the end of this method, you must set the variables rather than replacing
    //groups can not be changed so undefined it if it's there
    //req.body.group = undefined;

    const reqId = auth.getIdFromToken(
      req.get("authorization").replace("Bearer ", "")
    );

    //check if it's the correct and non empty task
    let foundTask = await task.findOne({ _id: req.params.taskId });
    if (!foundTask)
      throw errorHandler.createOperationalError(
        "The task does not exist.",
        500
      );

    let userList;
    //check if it's correct user
    if (req.body.user) {

      if(req.body.user !== "general") {
        const foundUser = await user.findOne({ _id: req.body.user });
        if (!foundUser)
          throw errorHandler.createOperationalError(
            "The new user does not exist.",
            500
          );
          req.body.userName = foundUser.firstName + " " + foundUser.lastName
      }
      else {
        req.body.userName = "general"
      }

    
      //check if it's the correct group
      const foundGroup = await group.findOne({ _id: foundTask.group });
      if (!foundGroup)
        throw errorHandler.createOperationalError(
          "The group does not exist.",
          500
        );

      //get the two users to swap ownership of the task
      let usersToChangeOwnerShip = foundGroup.users.filter(user => {
        return user.userId === req.body.user || user.userId === foundTask.user;
      });

      if (
        usersToChangeOwnerShip.length < 1 ||
        usersToChangeOwnerShip.length > 2
      )
        throw errorHandler.createOperationalError(
          "Users not found to update.",
          500
        );

      //swap. Is it better to just filter out what isn't the task vs splicing it out.
      if (usersToChangeOwnerShip.length === 2) {
        logger.log("info", "Swap", "Swapping Ownershp", "");
        if (usersToChangeOwnerShip[0].userId === req.body.user) {
          usersToChangeOwnerShip[0].taskId.push(req.params.taskId);
          const indexOfTask = usersToChangeOwnerShip[1].taskId.indexOf(
            foundTask.user
          );
          usersToChangeOwnerShip[1].taskId = usersToChangeOwnerShip[1].taskId.splice(
            indexOfTask,
            1
          );
        } else {
          usersToChangeOwnerShip[1].taskId.push(req.params.taskId);
          const indexOfTask = usersToChangeOwnerShip[0].taskId.indexOf(
            foundTask.user
          );
          usersToChangeOwnerShip[0].taskId = usersToChangeOwnerShip[0].taskId.splice(
            indexOfTask,
            1
          );
        }
        await usersToChangeOwnerShip[0].save();
        await usersToChangeOwnerShip[1].save();
      }
      userList = foundGroup.users.map(user => {
        return user.userId !== "general" ? user.userId : 0;
      });
    }

    logger.log("info", "task.findOneAndUpdate()", "Update the task", "");
    foundTask.set(req.body);
    await foundTask.save();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Update Task =============",
      ""
    );
    res.json(foundTask);
    emitChange(userList, foundTask, EMIT_CONSTANTS.EMIT_TASK_UPDATE);
  } catch (err) {
    next(err);
  }
};
