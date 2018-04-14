//TODO: NEED TO MAKE A NEW NOTIFICATION MODEL

// ============ Initializations =============

("use strict");

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  group = mongoose.model("Group"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../../utility/logUtil");

//===============================================

/**
 * Gets a specific user. User can only request his own information
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.inviteUser = async (req, res, next) => {
  try {
    //check token Id and requested User Id and see if they're the same.
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Starting Invite User =============",
      ""
    );

    logger.log("info", "user.findOne", "Checking User Exists", "");

    //get user and send
    let foundUser = await user.findOne({ _id: req.params.userId });
    if (!foundUser)
      throw errorHandler.createOperationalError("User does not exist", 500);

    logger.log("info", "group.findOne", "Checking Group Exists", "");

    const foundGroup = await group.findOne({ _id: req.params.groupId });
    if (!foundGroup)
      throw errorHandler.createOperationalError("Group does not exist", 500);

    //TODO: Check if the group is already in the notification list 
    //TODO: check if the user already has this group in his groups list
    //TODO: can't invite yourself

    logger.log(
      "info",
      "notifications.push",
      "Pushing the group into the notifications array",
      ""
    );

    const notification = {
      groupId: foundGroup._id,
      teamLeader: foundGroup.teamLeader,
      description: foundGroup.description,
      name: foundGroup.name
    };
    foundUser.notifications.push(notification);

    logger.log("info", "user.save", "Saving...", "");
    foundUser = await foundUser.save();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Invited the User =============",
      ""
    );

    res.json({ message: "Successfully invited user" });
  } catch (err) {
    next(err);
  }
};
