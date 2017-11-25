// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil");

// ============== Functions ===================
/**
 * Gets the group specified by the param groupId
 *
 * @param {any} req
 * @param {any} res returns the found group
 * @param {any} next errorHandler
 */
exports.getGroup = async (req, res, next) => {
  try {
    const foundGroup = await group.find({ _id: req.params.groupId });
    res.json(foundGroup);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

/**
 * Creates a group and adds the group to the user Id
 *
 * @param {any} req takes in Name, and Category type in body. Params must have userId
 * @param {any} res returns the new group
 * @param {any} next error handler
 */
exports.createGroup = async (req, res, next) => {
  try {
    //initialize body and all necessary values
    let foundUser = await user.findOne({ _id: req.params.userId });
    req.body.users = [{ userId: req.params.userId, taskId: [] }];
    req.body.teamLeader = {
      leaderId: req.params.userId,
      name: foundUser.firstName + " " + foundUser.lastName
    };
    let newGroup = new group(req.body);
    newGroup = await newGroup.save();
    const groupObj = {
      category: req.body.category,
      groupId: newGroup["_id"]
    };
    const updatedUser = foundUser.groups.push(groupObj);

    //set and save
    foundUser.set(updatedUser);
    foundUser = await foundUser.save();
    res.json(newGroup);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

exports.deleteGroup = function findGroup(req, res) {
  group.find({ _id: req.params.groupId }, function pullUsersAndTasks(
    err,
    foundGroup
  ) {
    if (err) {
      error.isOperational = true;
      next(err);
    } else {
      var users = [];
      var tasks = [];
      for (user of foundGroup.users) {
        users.push(user.userId);
        tasks.push(user.taskId);
      }
      user.find({ _id: { $in: users } }, function removeGroupFromEachUser(
        err,
        foundUsers
      ) {
        for (groupUser in foundUsers) {
          for (let index = 0; i < groupUser.groups.length; i++) {
            if (req.params.id === groupUser.groups[index].groupId) {
              groupUser.groups.splice(i, 1);
              groupUser.save(function updatedUsers(err, updatedGroupUser) {
                if (err) {
                  error.isOperational = true;
                  next(err);
                  return;
                }
              });
              break;
            }
          }
        }
      });
      task.remove({ _id: { $in: tasks } }, function errorHandle(err, tasks) {
        if (err) {
          error.isOperational = true;
          next(err);
          return;
        }
      });
      group.remove({ _id: req.params.groupId }, function sendResponse(
        err,
        removedGroup
      ) {
        if (err) {
          error.isOperational = true;
          next(err);
        } else {
          res.json({ message: "Group has successfully been removed" });
        }
      });
    }
  });
};


//TODO: Check if Users and Team Leaders can be changed

/**
 * Updates the group. The fields edited are teamLeader, Users and the group name. Changing team Leader and Users requires that
 * the group is category group and that the requester is a team leader. 
 * 
 * @param {any} req Team Leader, users and group name are in the body. Params is group Id
 * @param {any} res returns a message indicating that the group has been updated
 * @param {any} next error handler
 * @returns 
 */
exports.updateGroup = async (req, res, next) => {
  const token = req.get("authorization").replace("Bearer ", "")
  const tokenId = auth.getIdFromToken(token);
  //updating variables
  let newGroupInformation = {};
  if (req.body.name) newGroupInformation.name = req.body.name;
  if (req.body.teamLeader) newGroupInformation.teamLeader = req.body.teamLeader;
  if (req.body.users) newGroupInformation.users = req.body.users;

  //if all empty fields, reject
  if (!(req.body.users || req.body.name || req.body.teamLeader)) {
    const err = errorHandler.createOperationalError(
      "You need to change at least one thing!"
    );
    next(err);
    return;
  }
  try {
    let foundGroup = await group.findOne({ _id: req.params.groupId });

    //If it isn't the team leader who's updated, reject request
    if (foundGroup.teamLeader.leaderId != tokenId) {
      const err = errorHandler.createOperationalError(
        "Only the Team Leader can update the group!"
      );
      next(err);
      return;
    }

    //if the group is personal, you should not be allowed to update users or the team leader.
    if (foundGroup.category === "personal") {
      newGroupInformation.teamLeader = foundGroup.teamLeader;
      newGroupInformation.users = foundGroup.users;
    }

    //set and save
    foundGroup.set(newGroupInformation);
    foundGroup = await foundGroup.save();
    res.json({ message: "Successfully updated the group!" });
  } catch (err) {
    (err.isOperational = true), next(err);
  }
};

//============= Admin Functions =================
/**
 * Admin route. Gets all the groups in the database.
 *
 * @param {any} req
 * @param {any} res
 */
exports.getAllGroups = async (req, res) => {
  try {
    await auth.isAdmin(req.get("authorization"));
    const foundGroups = await group.find({});
    res.send(foundGroups);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};
