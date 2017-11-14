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
        const token = jwt.sign(payload, config.secret);
        user.password = undefined
        user.role = undefined
        res.json({ message: "Login Successful", token: token, user: user });
      }
    });
  }
};

//TODO: Verify no username is already in the database
exports.createUser = function(req, res) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    req.body.password = hash;
    const newUser = new user(req.body);
    newUser.save(function(err, user) {
      if (err) {
        res.send(err);
      } else {
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
