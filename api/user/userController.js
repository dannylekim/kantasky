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

/**
 * Tries to authenticate and verify the user with the credentials given 
 * 
 * @param {any} req has in the body a username and a password
 * @param {any} res 
 * @param {any} next moves on to the next handler
 */
exports.authenticate = async function(req, res, next) {
  try {
    const isNotEmpty = await fieldChecks(req, res, next); //checks if the fields are empty or not
    if (isNotEmpty) {
      const user = await auth.verifyPassword(req.body); //verifies the hash and returns the user
      const token = createJsonToken(user); //returns a token that gives the id and role
      res.json({ message: "Login Successful", token: token });
    }
  } catch (e) {
    next(e); //sends to next handler
  }
};
/**
 * Creates a JWT using the ID and Role as payload from the user object
 * 
 * @param {any} user 
 * @returns 
 */
function createJsonToken(user) {
  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, config.secret, { expiresIn: "10h" });
  return token;
}

/**
 * Verifies that there are no empty fields
 * 
 * @param {any} req has in the body a username and a password
 * @param {any} res 
 * @param {any} next moves on to the next handler
 * @returns 
 */
function fieldChecks(req, res, next) {
  return new Promise((resolve, reject) => {
    if (!req.body.username) {
      let err = errorHandler.createOperationalError(
        "Please input a username",
        401
      );
      reject(err);
      return;
    } else if (!req.body.password) {
      let err = errorHandler.createOperationalError(
        "Please input a password",
        401
      );
      err.status = 401;
      reject(err);
    } else {
      resolve(true);
    }
  });
}

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
