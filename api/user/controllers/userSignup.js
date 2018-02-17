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

//===============================================

/**
 * Creates a user in the database
 *
 * @param {any} req has all the fields necessary
 * @param {any} res returns the newly created user
 * @param {any} next error handler
 */
exports.createUser = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Create User =============",
      ""
    );
    try {
      logger.log(
        "info",
        "auth.isPasswordValid()",
        "Checking if the password fulfills the requirements",
        ""
      );
      let errors = await auth.isPasswordValid(req.body.password);
      let foundUser = (await user.find({ username: req.body.username }))[0];
  
      //Finding user checks. If username or email already exists in the db, then reject
      if (foundUser)
        errors.push(
          "A user with this username already exists, please choose another one."
        );
  
      foundUser = await user.findOne({ email: req.body.email });
      if (foundUser) errors.push("This email is already in use!");
  
      if (errors.length > 0) {
        let err = errorHandler.createOperationalError("", 401);
        err.message = errors
        throw err
  
      }
  
      //hash the password, save it into the database and then return the user without password or role
      logger.log("info", "bcrypt.hash()", "Hashing the password", "");
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
      const newUser = new user(req.body);
      logger.log("info", "newUser.save()", "Creating User...", "");
      foundUser = await newUser.save();
      foundUser.password = undefined;
      foundUser.role = undefined;
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Created User =============",
        ""
      );
      res.json(foundUser);
    } catch (err) {
      next(err);
    }
  };
  