"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../config/globalFunctions");

//very heavy function. Rethink this when you can because it is a triple database call with a triple nested for loop
//Either there's a solution in terms of the implementation of the api or the database model
//TODO: Test 
exports.getUsersTask = function(req, res) {
  user.find({ _id: req.params.userId }, function(err, user) {
    if (err || user === null || user === undefined) res.send(err);
    else if(!user.groups){
      res.json({message: "User has no tasks"})
    }
    else {
      var groupIds = [];
      
      for (groups of user.groups) {
        groupIds.push(groups.groupId);
      }
      group.find({ _id: { $in: groupIds } }, function(err, groups) {
        if (err) {
          res.send(err);
        } else {
          var userTasks = [];
          for (group in groups) {
            for (groupUser in groups.user) {
              if (groupUser.id === user.id) {
                userTasks.push(groupUser.taskId);
              }
            }
          }
          task.find({ _id: { $in: userTasks } }, function(err, tasks) {
            if (err) res.send(err);
            else {
              res.json(tasks);
            }
          });
        }
      });
    }
  });
};

exports.createTaskInGroup = function(req, res) {
  var newTask = new task(req.body);
  newTask.save(function(err, task) {
    if (err) res.send(err);
    else {
      group.findOneAndUpdate(
        { _id: groupId },
        { $push: { 'taskId': task._id, 'userId': req.params.taskId } },
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

//TODO: delete association to the group
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


//TODO:Association of task to user in group 
exports.assignTaskToGroupUser = function(){
  
}

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

// ===== Obsolete ====================
exports.getTask = function(req, res) {
  task.findById(req.params.taskId, function(err, task) {
    if (err) res.send(err);
    else res.json(task);
  });
};

//promises not callbacks
