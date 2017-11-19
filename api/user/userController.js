// ============ Initializations =============

"use strict";

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../config/config"),
  jwt = require("jsonwebtoken");

// ================ Functions ==================

exports.authenticate = function fieldChecks(req, res) {
  if (!req.body.username) {
    errorHandler.createOperationalError("Please input a username");
  } else if (!req.body.password) {
    errorHandler.createOperationalError("Please input a password");
  } else {
    auth.verifyPassword(req.body, function sendResponse(err, result, user) {
      if (err) {
        next(err);
      } else {
        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, config.secret, { expiresIn: "10h" });
        res.json({ message: "Login Successful", token: token });
      }
    });
  }
};

exports.createUser = function isThePasswordValid(req, res) {
  if (!auth.isPasswordValid(req.body.password)) {
    errorHandler.createOperationalError("Password is not valid");
    return;
  }
  user.find({ username: req.body.username }, function userChecksAndHash(
    err,
    user
  ) {
    if (err) {
      err.isOperational = true;
      next(err);
    } else if (user)
      errorHandler.createOperationalError("This user already exists!");
    else {
      user.find({ email: req.body.email }, function(err, user) {
        if (err) {
          err.isOperational = true;
          next(err);
        } else if (user)
          errorHandler.createOperationalError("This email is already in use!");
        else {
          bcrypt.hash(req.body.password, 10, function saveNewUser(err, hash) {
            req.body.password = hash;
            const newUser = new user(req.body);
            newUser.save(function sendResponse(err, user) {
              if (err) {
                err.isOperational = true;
                next(err);
              } else {
                user.password = undefined;
                user.role = undefined;
                res.json(user);
              }
            });
          });
        }
      });
    }
  });
};

exports.getAllUsers = function isThisAdmin(req, res) {
  auth.isAdmin(req.get("authorization"), function findAllUsers(err, isAdmin) {
    if (err) {
      err.isOperational = true;
      next(err);
    } else {
      user.find({}, function sendResponse(err, user) {
        if (err) {
          err.isOperational = true;
          next(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};

exports.deleteUser = function checkAdmin(req, res) {
  auth.isAdmin(req.get("authorization"), function removeUser(err, isAdmin) {
    if (err) {
      err.isOperational = true;
      next(err);
    } else {
      user.remove(
        {
          _id: req.params.userId
        },
        function sendResponse(err, task) {
          if (err) {
            err.isOperational = true;
            next(err);
          }
          res.json({ message: "User successfully removed" });
        }
      );
    }
  });
};

exports.updateUser = function replaceFields(req, res) {
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

  user.find({ _id: req.params.userId }, function updateTheUser(err, foundUser) {
    if (err) {
      err.isOperational;
      next(err);
    } else {
      user.set(updatedUser);
      user.save(function sendResponse(err, updatedUser) {
        if (err) {
          err.isOperational = true;
          next(err);
        } else res.json(updatedUser);
      });
    }
  });
};

exports.changePassword = function checkValidityOfPassword(req, res) {
  if (req.body.password && auth.isPasswordValid(req.body.password)) {
    user.find({ _id: req.params.id }, function setTheParameters(
      err,
      foundUser
    ) {
      foundUser.set({ password: req.body.password });
      foundUser.save(function sendResponse(err, updatedUser) {
        if (err) {
          err.isOperational = true;
          next(err);
        } else res.json(updatedUser);
      });
    });
  }
};
