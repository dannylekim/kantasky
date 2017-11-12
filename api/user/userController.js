"use strict";

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../config/authentication"),
  bcrypt = require("bcrypt"),
  config = require("../../config/config"),
  jwt = require("jsonwebtoken");

exports.authenticate = function(req, res) {
  if (!req.body.username || !req.body.password) {
    res.json({ message: "missing fields" });
  } else {
    auth.verifyPassword(req.body, function(err, result, id) {
      if (err) {
        res.status(400).json({ message: err });
      } else {
        const payload = { id: id };
        const token = jwt.sign(payload, config.secret);
        res.json({ message: "Login Successful", token: token });
      }
    });
  }
};

exports.createUser = function(req, res) {
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    req.body.password = hash;
    const newUser = new user(req.body);
    newUser.save(function(err, user) {
      if (err) res.send(err);
      res.json({ message: "User successfully created" });
    });
  });
};

exports.getAllUsers = function(req, res) {
  user.find({}, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.deleteUser = function(req, res) {
  user.remove(
    {
      _id: req.params.userId
    },
    function(err, task) {
      if (err) res.send(err);
      res.json({ message: "User successfully removed" });
    }
  );
};
