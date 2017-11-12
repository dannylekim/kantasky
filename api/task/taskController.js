"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task");

exports.getAllTasks = function(req, res) {
  task.find({}, function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
};

exports.createTask = function(req, res) {
  var newTask = new task(req.body);
  newTask.save(function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
};

exports.getTask = function(req, res) {
  task.findById(req.params.taskId, function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
};

exports.updateTask = function(req, res) {
  task.findOneAndUpdate(
    { _id: req.params.taskId },
    req.body,
    { new: true },
    function(err, task) {
      if (err) res.send(err);
      res.json(task);
    }
  );
};

exports.deleteTask = function(req, res) {
  task.remove(
    {
      _id: req.params.taskId
    },
    function(err, task) {
      if (err) res.send(err);
      res.json({ message: "Task successfully removed" });
    }
  );
};


//promises not callbacks
