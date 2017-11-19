// ================= Initializations ===============

"use strict";
const mongoose = require("mongoose"),
  Schema = mongoose.Schema;


// ================= Schema ===============  
const groupSchema = new Schema({
  users: [
    {
      userId: String,
      taskId: []
    }
  ],
  name: {
    type: String,
    required: "Please input a name for the group"
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  teamLeader: String
});

module.exports = mongoose.model("Group", groupSchema);
