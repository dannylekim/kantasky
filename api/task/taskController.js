"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../config/authUtil"),
  errorHandler = require("../../config/errorUtil");

//very heavy function. Rethink this when you can because it is a triple database call with a triple nested for loop
//Either there's a solution in terms of the implementation of the api or the database model
//FIXME: Test
exports.getUsersTask = function findUser(req, res) {
  user.find({ _id: req.params.userId }, function pullAllGroups(err, user) {
    if (err) {
      err.isOperational = true;
      next(err);
    } else if (user === null || user === undefined) {
      errorHandler.createOperationalError("User not found");
    } else if (!user.groups) {
      errorHandler.createOperationalError("User has no tasks");
    } else {
      var groupIds = [];
      for (groups of user.groups) {
        groupIds.push(groups.groupId);
      }
      group.find({ _id: { $in: groupIds } }, function pullAllTasksFromGroups(
        err,
        groups
      ) {
        if (err) {
          error.isOperational = true;
          next(err);
        } else {
          var userTasks = [];
          for (group of groups) {
            for (groupUser of group.user) {
              if (groupUser.id === user.id) {
                userTasks.push(groupUser.taskId);
              }
            }
          }
          task.find({ _id: { $in: userTasks } }, function sendResponse(
            err,
            tasks
          ) {
            if (err) {
              error.isOperational = true;
              next(err);
            } else {
              res.json(tasks);
            }
          });
        }
      });
    }
  });
};

exports.createTaskInGroup = function setAndSaveNewTask(req, res) {
  var newTask = new task(req.body);
  newTask.save(function updateThatGroup(err, task) {
    if (err) {
      error.isOperational = true;
      next(err);
    } else {
      group.findOneAndUpdate(
        { _id: groupId },
        { $push: { taskId: task._id, userId: req.params.userId } },
        { new: true },
        function sendResponse(err, task) {
          if (err) {
            error.isOperational = true;
            next(err);
            return;
          } else {
            res.json(task);
          }
        }
      );
    }
  });
};

exports.updateTask = function findSpecificTask(req, res) {
  task.findOneAndUpdate(
    { _id: req.params.taskId },
    req.body,
    { new: true },
    function sendResponse(err, task) {
      if (err) {
        error.isOperational = true;
        next(err);
      } else res.json(task);
    }
  );
};

exports.deleteTask = function removeTheTask(req, res) {
  task.remove(
    {
      _id: req.params.taskId
    },
    function findTaskInGroupAndRemove(err, task) {
      if (err) {
        error.isOperational = true;
        next(err);
      } else {
        group.find(
          { _id: req.params.groupId },
          function findTheUserAndDeleteTask(err, group) {
            for (user in group.users) {
              for (let index = 0; index < group.users[index].length; index++) {
                if (task._id === user[index]) {
                  user.splice(index, 1);
                  group.save(function sendResponse(err, group) {
                    if (err) {
                      error.isOperational = true;
                      next(err);
                      return;
                    } else {
                      res.json({ message: "Task successfully removed" });
                    }
                  });
                }
              }
            }
          }
        );
      }
    }
  );
};

//=================== Admin Functions =======================

exports.getAllTasks = function checkIfAdmin(req, res) {
  auth.isAdmin(req.get("authorization"), function findTasks(err, isAdmin) {
    if (err) {
      error.isOperational = true;
      next(err);
    } else {
      task.find({}, function sendResponse(err, task) {
        if (err) {
          error.isOperational = true;
          next(err);
        } else res.json(task);
      });
    }
  });
};

// ===== Obsolete ====================
exports.getTask = function LookForTask(req, res) {
  task.findById(req.params.taskId, function sendResponse(err, task) {
    if (err) {
      error.isOperational = true;
      next(err);
    } else res.json(task);
  });
};

//promises not callbacks
