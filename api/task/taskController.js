"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task");

//promises not callbacks

exports.GetAllTasks = function(req, res) {
  task.find({}, function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
};

exports.CreateTask = function(req, res) {
  var newTask = new task(req.body);
  newTask.save(function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
};

exports.GetTask = function(req, res) {
  task.findById(req.params.taskId, function(err, task) {
    if (err) res.send(err);
    res.json(task);
  });
};

exports.UpdateTask = function(req, res) {
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

exports.DeleteTask = function(req, res) {
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
