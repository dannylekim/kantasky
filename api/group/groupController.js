// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil");

// ============== Functions ===================

exports.getGroup = function findGroup(req, res) {
  group.find({ _id: req.params.groupId }, function sendResponse(err, group) {
    if (err) {
      error.isOperational = true;
      next(err);
    } else {
      res.json(group);
    }
  });
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
    let foundUser = await user.findOne({_id: req.params.userId})
    req.body.users = [{ userId: req.params.userId, taskId: [] }];
    req.body.teamLeader = req.params.userId;
    let newGroup = new group(req.body);
    newGroup = await newGroup.save();
    const groupObj = {
      "category": req.body.category,
      "groupId": newGroup["_id"]
    }
    const updatedUser = foundUser.groups.push(groupObj)
    
    foundUser.set(updatedUser)
    foundUser = await foundUser.save()
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

exports.updateGroup = function findGroup(req, res) {
  group.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true },
    function sendResponse(err, group) {
      if (err) {
        error.isOperational = true;
        next(err);
      } else {
        res.json(group);
      }
    }
  );
};

//============= Admin Functions =================

exports.getAllGroups = function findAllGroups(req, res) {
  group.find({}, function sendResponse(err, group) {
    if (err) {
      error.isOperational = true;
      next(err);
    } else {
      res.json(group);
    }
  });
};
