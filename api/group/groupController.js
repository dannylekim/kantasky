"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../config/globalFunctions");


exports.getGroup = function(req, res) {
  group.find({ _id: req.params.groupId }, function(err, group) {
    if (err) {
      res.send(err);
    } else {
      res.json(group);
    }
  });
};

//this needs to be associated to user
exports.createGroup = function(req, res) {
  const newGroup = new group(req.body);
  group.save(function(err, group) {
    if (err) res.send(err);
    else {
      res.json(group);
    }
  });
};

//delete this group from all users
//delete all tasks
exports.deleteGroup = function(req, res) {
  group.remove({ _id: req.params.id }, function(err, group) {
    if (err) res.send(err);
    else {
      res.json({ message: "Group has been deleted" });
    }
  });
};

exports.updateGroup = function(req, res) {
  group.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true },
    function(err, group) {
      if (err) res.send(err);
      else {
        res.json(group);
      }
    }
  );
};

//============= Admin Functions =================

exports.getAllGroups = function(req, res) {
  group.find({}, function(err, group) {
    if (err) res.send(err);
    else {
      res.json(group);
    }
  });
};
