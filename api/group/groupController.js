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

exports.createGroup = function(req, res) {
  req.body.users = [{'userId': req.params.userId, 'taskId': []}]
  req.body.teamLeader = req.params.userId
  const newGroup = new group(req.body);
  group.save(function(err, group) {
    if (err) res.send(err);
    else {
      res.json(group);
    }
  });
};


exports.deleteGroup = function(req, res) {
  group.find({_id: req.params.groupId}, function(err, foundGroup){
    if(err){
      res.send(err)
    }
    else{
    var users = []
    for (user of foundGroup.users){
      users.push(user.userId)
    }
    user.find({_id: {$in: users}}, function(err, foundUsers){
      for(groupUser in foundUsers){
        for(let index = 0; i < groupUser.groups.length; i++){
          if(req.params.id === groupUser.groups[index].groupId){
            groupUser.groups.splice(i, 1)
            groupUser.save(function(err, updatedGroupUser){
              if(err) {
                res.send(err)
                return
              }
              else{
                break;
              }
            })
          }
        }
      }
      group.remove({_id: req.params.groupId}, function(err, removedGroup){
        if(err) res.send(err)
        else{
          res.json({message:"Group has successfully been removed"})
        }
      })
    })}
  })
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
