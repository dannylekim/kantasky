// ================= Initializations ===============

"use strict";
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const errorHandler = require("../../utility/errorUtil");

// ================= Functions ===============

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
  notifications: [],
  createdDate: [
    {
      type: Date,
      default: Date.now
    }
  ]
});

userSchema.methods.isPasswordValid = async function(password) {
  try {
    const storedHash = this.password;
    const res = await bcrypt.compare(password, storedHash);
    if (!res) {
      var error = errorHandler.createOperationalError(
        "Wrong Password. Please Try Again."
      );
      return Promise.reject(error);
    }
    return Promise.resolve();
  } catch (e) {
    e.isOperational = true;
    return Promise.reject(e);
  }
};

module.exports = mongoose.model("User", userSchema);
