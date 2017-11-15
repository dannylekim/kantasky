"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: "Please input an email"
  },
  username: {
    type: String,
    required: "Please input a username"
  },
  password: {
    type: String,
    required: "Please input a password"
  },
  role: {
    type: [
      {
        type: String,
        enum: ["user", "admin"]
      }
    ],
    default: "user"
  },
  firstName: {
    type: String,
    required: "Please put a first name"
  },
  lastName: {
    type: String,
    required: "Please put a last name"
  },
  groups: [
    {
      category: {
        type: String,
        enum: ["group", "personal"]
      },
      groupId: String
    }
  ],
  notifications: []
});

userSchema.methods.isPasswordValid = function(password, callback, id) {
  const storedHash = this.password;
  bcrypt.compare(password, storedHash, function(err, res) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback(null, res, id);
    }
  });
};

module.exports = mongoose.model("User", userSchema);
