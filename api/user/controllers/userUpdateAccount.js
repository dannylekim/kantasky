// ============ Initializations =============

("use strict");

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../../utility/logUtil"),
  { emitChange, EMIT_CONSTANTS } = require("../../../utility/socketUtil");

//===============================================

/**
 * Updates a users first name, last name and email
 *
 * @param {any} req contains one of the above
 * @param {any} res
 * @param {any} next
 */
exports.updateAccountInformation = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Start Update Account Information =============",
    ""
  );
  //place new values into an object
  let updatedUser = {};
  if (req.body.firstName) updatedUser.firstName = req.body.firstName;
  if (req.body.lastName) updatedUser.lastName = req.body.lastName;
  if (req.body.email) updatedUser.email = req.body.email;
  if (req.body.notifications)
    updatedUser.notifications = req.body.notifications;

  try {
    //if all empty fields, reject
    if (
      !(
        updatedUser.firstName ||
        updatedUser.lastName ||
        updatedUser.email ||
        req.body.notifications
      )
    ) {
      const err = errorHandler.createOperationalError(
        "You need to change at least one thing!"
      );
      throw err;
    }

    let foundUser = await user.findOne({ _id: req.params.userId });

    //verify user is in db
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User is not found in the database",
        500
      );
      throw err;
    }

    logger.log("info", "foundUser.set()", "Setting new information", "");
    foundUser.set(updatedUser); //update the user

    logger.log("info", "foundUser.save()", "Updating the user", "");

    listOfGroupIds = foundUser.groups.map(group => {
      return group.groupId;
    });

    logger.log("info", "foundUser.save()", "Updating user in Groups", "");
    for (let groupId of listOfGroupIds) {
      let foundGroup = await group.findOne({ _id: groupId });
      if (!foundGroup) {
        const err = errorHandler.createOperationalError("Cannot find group");
        throw err;
      }
      let userObj = foundGroup.users.find(user => {
        return user.userId === foundUser.id;
      });
      userObj.userName = foundUser.firstName + " " + foundUser.lastName;
      if (foundGroup.teamLeader.leaderId === foundUser.id) {
        foundGroup.teamLeader.name = userObj.userName;
      }
      await foundGroup.save();
    }

    let allTasks = await task.find({ user: foundUser.id });
    for (aTask of allTasks) {
      aTask.userName = foundUser.firstName + " " + foundUser.lastName;
      aTask.save();
    }

    foundUser = await foundUser.save();
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully updated the Account =============",
      ""
    );

    foundUser.password = undefined;
    foundUser.role = undefined;
    res.send(foundUser);
    emitChange([req.params.userId], foundUser, EMIT_CONSTANTS.EMIT_USER_UPDATE);
  } catch (err) {
    next(err);
  }
};
