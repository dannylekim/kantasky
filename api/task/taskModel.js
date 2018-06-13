// ================= Initializations ===============

"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ================= Schemas ===============

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: "Please enter a task"
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      default: undefined
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed"],
      default: ["pending"]
    },
    importance: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: ["normal"]
    },
    user: String,
    group: String,
    category: {
      type: String,
      default: "Misc."
    },
    description: String
  },
  { usePushEach: true }
);

module.exports = mongoose.model("Task", taskSchema);
