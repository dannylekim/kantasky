"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../config/authUtil");

exports.getGroup = function findGroup(req, res) {
  group.find({ _id: req.params.groupId }, function sendResponse(err, group) {
    if (err) {
      res.send(err);
    } else {
      res.json(group);
    }
  });
};

exports.createGroup = function setParametersAndSave(req, res) {
  req.body.users = [{ userId: req.params.userId, taskId: [] }];
  req.body.teamLeader = req.params.userId;
  const newGroup = new group(req.body);
  group.save(function sendResponse(err, group) {
    if (err) res.send(err);
    else {
      res.json(group);
    }
  });
};

exports.deleteGroup = function findGroup(req, res) {
  group.find({ _id: req.params.groupId }, function pullUsersAndTasks(
    err,
    foundGroup
  ) {
    if (err) {
      res.send(err);
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
                  res.send(err);
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
          res.send(err);
          return;
        }
      });
      group.remove({ _id: req.params.groupId }, function sendResponse(
        err,
        removedGroup
      ) {
        if (err) res.send(err);
        else {
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
      if (err) res.send(err);
      else {
        res.json(group);
      }
    }
  );
};

//============= Admin Functions =================

exports.getAllGroups = function findAllGroups(req, res) {
  group.find({}, function sendResponse(err, group) {
    if (err) res.send(err);
    else {
      res.json(group);
    }
  });
};
