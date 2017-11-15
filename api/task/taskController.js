"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  auth = require("../../config/globalFunctions");

//There's probably a way to query the database to get what you want rather than a O(n^3) solution
exports.getUsersTasks = function(req, res) {
  var groupIds = [];
  for (groups of req.body) {
    groupIds.push(groups.groupId);
  }
  group.find({ id: { $in: groupIds } }, function(err, groups) {
    if (err) {
      res.send(err);
    } else {
      var userTasks = [];
      for (group of groups) {
        for (tasksArray of group.tasks) {
          for (tasks of tasksArray) {
            userTasks.push(tasks.task);
          }
        }
      }
      res.json(userTasks);
    }
  });
};

exports.createTask = function(req, res) {
  var newTask = new task(req.body);
  newTask.save(function(err, task) {
    if (err) res.send(err);
    else {
      group.findOneAndUpdate(
        { _id: groupId },
        { $push: { task: task, userId: userId } },
        { new: true },
        function(err, task) {
          if (err) {
            return err;
          } else {
            res.json(task);
          }
        }
      );
    }
  });
};

//protect api by having to check if the user actually has that task
exports.getTask = function(req, res) {
  task.findById(req.params.taskId, function(err, task) {
    if (err) res.send(err);
    else res.json(task);
  });
};

//protect api by having to check if the user actually has that task
exports.updateTask = function(req, res) {
  task.findOneAndUpdate(
    { _id: req.params.taskId },
    req.body,
    { new: true },
    function(err, task) {
      if (err) res.send(err);
      else res.json(task);
    }
  );
};

//protect api by having to check if the user actually has that task
exports.deleteTask = function(req, res) {
  task.remove(
    {
      _id: req.params.taskId
    },
    function(err, task) {
      if (err) res.send(err);
      else res.json({ message: "Task successfully removed" });
    }
  );
};

//=================== Admin Functions =======================

exports.getAllTasks = function(req, res) {
  auth.isAdmin(req.get("authorization"), function(err, isAdmin) {
    if (err) {
      res.status(401).send(err);
    } else {
      task.find({}, function(err, task) {
        if (err) res.send(err);
        else res.json(task);
      });
    }
  });
};

//promises not callbacks
