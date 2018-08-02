// ================= Initializations ===============

"use strict";
const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

// ================= Schema ===============
const groupSchema = new Schema(
  {
    users: [
      {
        userId: String,
        taskId: [String],
        userName: String,
        _id: false
      }
    ],
    name: {
      type: String,
      required: "Please input a name for the group."
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    teamLeader: {
      name: String,
      leaderId: String
    },
    category: {
      type: String,
      enum: ["group", "personal"],
      required: "Need to specify the category of this group.",
      _id: false
    },
    description: {
      type: String
    }
  },
  { usePushEach: true }
);

module.exports = mongoose.model("Group", groupSchema);
