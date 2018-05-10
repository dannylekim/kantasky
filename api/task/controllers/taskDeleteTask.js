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

//TODO:TEST
/**
 * Deletes the task in the database and the task from the user in the group.
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.deleteTask = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Delete Task =============s",
    ""
  );
  try {
    //verify if task exists
    let foundTask = await task.findOne({ _id: req.params.taskId });
    if (!foundTask) {
      const err = errorHandler.createOperationalError(
        "Task does not exist in the database",
        500
      );
      throw err;
    }

    //verify if group exists
    let foundGroup = await group.findOne({ _id: foundTask.group });

    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database",
        500
      );
      throw err;
    }

    logger.log(
      "info",
      "Bulk Edit all groups and users",
      "Check all groups with user inside for that one task and remove it all.",
      ""
    );
    let isUserFound = false;
    for (let user of foundGroup.users) {
      if (user.userId === foundTask.user) {
        const index = user.taskId.indexOf(req.params.taskId);
        if (index <= -1)
          throw errorHandler.createOperationalError(
            "Task not found in group",
            500
          );
        user.taskId = user.taskId.splice(index, 1);
        isUserFound = true;
        break;
      }
    }
    if (isUserFound) await foundGroup.save();
    else
      throw errorHandler.createOperationalError(
        "User was not found in group",
        500
      );

    //remove the task

    logger.log("info", "foundTask.remove()", "Removing Tasks", "");
    await foundTask.remove();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Delete Task =============",
      ""
    );
    res.json({ message: "Task has successfully been removed" });
    const userList = foundGroup.users.map(user => {
      return user.userId !== "general" ? user.userId : 0;
    });
    emitChange(userList, req.params.taskId, EMIT_CONSTANTS.EMIT_TASK_DELETE);
  } catch (err) {
    next(err);
  }
};
