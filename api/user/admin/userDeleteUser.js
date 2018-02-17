// ============ Initializations =============

("use strict");

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../../utility/logUtil");


//TODO: Need to implement this to delete all tasks and groups...Actually do we need to really have this done
exports.deleteUser = async (req, res) => {
    try {
      await auth.isAdmin(req.get("Authorization"));
    } catch (err) {
      err.isOperational = true;
      next(err);
    }
  };
  