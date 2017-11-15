"use strict";
const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const groupSchema = new Schema({
    users: [],
    tasks: [{
        task: [],
        userId: String,
    }],
    name: {
        type: String,
        required: "Please input a name for the group"
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    teamLeader: {
        type: [],
        required: "A Team Leader must be assigned to this group"
    }
})

module.exports = mongoose.model("Group", groupSchema);

