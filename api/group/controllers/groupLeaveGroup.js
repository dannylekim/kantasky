// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");


//TODO: Assign new team leader, remove groups from this user and move all user's tasks to general user. If last user, delete group.
exports.leaveGroup = async (req, res, next) => {



};