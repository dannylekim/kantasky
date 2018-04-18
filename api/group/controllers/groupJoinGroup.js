//return

// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");

//    join/group:id
exports.joinGroup = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Start Join Group =============",
    ""
  );

  const token = req.get("authorization").replace("Bearer ", "");
  const tokenId = auth.getIdFromToken(token);
  try {
    //check if user exists

    logger.log(
      "info",
      "user.findOne",
      "Checking if user exists in database",
      ""
    );
    let foundUser = await user.findOne({ _id: tokenId });
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User is not found in the database",
        500
      );
      throw err;
    }

    //check if group exists

    logger.log(
      "info",
      "group.findOne",
      "Checking if group exists in database",
      ""
    );

    let foundGroup = await group.findOne({ _id: req.params.groupId });
    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group is not found in the database",
        500
      );
      throw err;
    }

    logger.log(
      "info",
      "user.notifications.filter",
      "Checking if group exists in user's notifications",
      ""
    );

    //check if user has a notification to join this group
    const oneLessNotification = foundUser.notifications.filter(
      notification => notification.groupId !== foundGroup._id
    );

    if (oneLessNotification.length === foundUser.notifications.length) {
      const err = errorHandler.createOperationalError(
        "There was no invite to join this group.",
        500
      );
      throw err;
    }

    foundUser.notifications = oneLessNotification;

    const hasGroupAlreadyIn = foundUser.groups.find(group => {
      return group.groupId === foundGroup._id;
    });

    if (hasGroupAlreadyIn) {
      throw errorHandler.createOperationalError(
        "User is already a part of this group",
        403
      );
    }

    logger.log("info", "userGroup.users.push", "Saving user in group", "");
    //add user to group
    if (foundGroup.category !== "personal") {
      foundGroup.users.push({ userId: foundUser._id, taskId: [] });
    }

    foundGroup = await foundGroup.save();

    logger.log(
      "info",
      "user.notifications.push",
      "Saving group in user and removed notification",
      ""
    );

    //add group to user
    foundUser.groups.push({ category: "group", groupId: foundGroup._id });

    foundUser = await foundUser.save();

    res.send(foundGroup);
  } catch (err) {
    next(err);
  }
};
