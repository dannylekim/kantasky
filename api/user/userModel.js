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
      groupId: String,
      _id: false
    }
  ],

  //this should be its own model with its own CRUD functions but this is a quicker implementation
  notifications: [
    {
      groupId: String,
      teamLeader: {},
      description: String,
      name: String,
      unread: { type: Boolean, default: true },
      _id: false
    }
  ],
  createdDate: [
    {
      type: Date,
      default: Date.now
    }
  ]
});

/**
 * Verifies the validity by comparing the tried password and the stored password
 *
 * @param {any} password
 * @returns
 */
userSchema.methods.isPasswordValid = async function(password) {
  try {
    const storedHash = this.password;
    const res = await bcrypt.compare(password, storedHash); // verification
    if (!res) {
      let error = errorHandler.createOperationalError(
        "Wrong Password. Please Try Again.",
        401
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
