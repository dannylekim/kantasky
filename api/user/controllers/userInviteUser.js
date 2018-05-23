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
  { emitChange, EMIT_CONSTANTS } = require("../../../utility/socketUtil");
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

    //Check if the group is already in the notification list

    const hasSamenotification = foundUser.notifications.find(notification => {
      return notification.groupId === foundGroup._id;
    });

    if (hasSamenotification) {
      throw errorHandler.createOperationalError(
        "User already has a pending invitation to this group",
        403
      );
    }

    // check if the user already has this group in his groups list

    const hasGroupAlreadyIn = foundUser.groups.find(group => {
      return group.groupId === foundGroup._id;
    });

    if (hasGroupAlreadyIn) {
      throw errorHandler.createOperationalError(
        "User is already a part of this group",
        403
      );
    }

    //can't invite yourself
    const token = req.get("authorization").replace("Bearer ", "");
    const userId = auth.getIdFromToken(token);

    if (userId === foundUser._id) {
      throw errorHandler.createOperationalError(
        "User cannot invite themselves to a group",
        403
      );
    }

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

    foundUser.password = undefined;
    foundUser.role = undefined;
    emitChange([req.params.userId], foundUser, EMIT_CONSTANTS.EMIT_USER_UPDATE);
  } catch (err) {
    next(err);
  }
};
