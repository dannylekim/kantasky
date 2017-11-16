"use strict";

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../config/globalFunctions"),
  bcrypt = require("bcrypt"),
  config = require("../../config/config"),
  jwt = require("jsonwebtoken");

exports.authenticate = function(req, res) {
  if (!req.body.username) {
    res.json({ message: "Please input a username" });
  } else if (!req.body.password) {
    res.json({ message: "Please input a password" });
  } else {
    auth.verifyPassword(req.body, function(err, result, user) {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, config.secret, { expiresIn: "10h" });
        res.json({ message: "Login Successful", token: token });
      }
    });
  }
};

//TODO: Verify no username is already in the database and parse password to be safe
exports.createUser = function(req, res) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    req.body.password = hash;
    const newUser = new user(req.body);
    newUser.save(function(err, user) {
      if (err) {
        res.send(err);
      } else {
        user.password = undefined;
        user.role = undefined;
        res.json({ user });
      }
    });
  });
};

exports.getAllUsers = function(req, res) {
  auth.isAdmin(req.get("authorization"), function(err, isAdmin) {
    if (err) {
      res.status(401).send(err);
    } else {
      user.find({}, function(err, user) {
        if (err) {
          res.send(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};

exports.deleteUser = function(req, res) {
  auth.isAdmin(req.get("authorization"), function(err, isAdmin) {
    if (err) {
      res.status(401).send(err);
    } else {
      user.remove(
        {
          _id: req.params.userId
        },
        function(err, task) {
          if (err) res.send(err);
          res.json({ message: "User successfully removed" });
        }
      );
    }
  });
};


exports.updateUser = function(req, res) {
  var updateUser = {};
  if (req.body.firstName) {
    updatedUser.firstName = req.body.firstName;
  }
  if (req.body.lastName) {
    updatedUser.lastName = req.body.lastName;
  }
  if (req.body.email) {
    updatedUser.email = req.body.email;
  }

  user.find({ _id: req.params.userId }, function(err, foundUser) {
    if (err) res.send(err);
    else {
      user.set(updatedUser);
      user.save(function(err, updatedUser) {
        if (err) res.send(err);
        else res.json(updatedUser);
      });
    }
  });
};

//TODO: password checks
exports.changePassword = function(req, res) {
  if(req.body.password){
    user.find({_id: req.params.id}, function(err, foundUser){
      foundUser.set({password: req.body.password})
      foundUser.save(function(err, updatedUser){
        if(err) res.send(err)
        else res.json(updatedUser)
      })
    })
  }
};
