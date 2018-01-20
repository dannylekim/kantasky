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
 * Tries to authenticate and verify the user with the credentials given
 *
 * @param {any} req has in the body a username and a password
 * @param {any} res goal is to return a token that has ID and role
 * @param {any} next moves on to the next handler
 */
exports.authenticate = async (req, res, next) => {
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Login =============",
      ""
    );
    try {
      logger.log("info", "fieldChecks()", "Checking if fields are empty", "");
      const isNotEmpty = await fieldChecks(req, res, next); //checks if the fields are empty or not
  
      if (isNotEmpty) {
        logger.log(
          "info",
          "auth.verifyPassword",
          "Verify if the password is correct",
          ""
        );
        const user = await auth.verifyPassword(req.body); //verifies the hash and returns the user
        const token = createJsonToken(user); //returns a token that gives the id and role
  
        logger.log(
          "info",
          req.method + " " + req.baseUrl + req.url,
          "============= Successful Login =============",
          ""
        );
        res.json({ message: "Login Successful", token: token });
      }
    } catch (err) {
      next(err); //sends to next handler
    }
  };
  /**
   * Creates a JWT using the ID and Role as payload from the user object
   *
   * @param {any} user
   * @returns
   */
  function createJsonToken(user) {
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, config.secret);
    return token;
  }
  
  /**
   * Verifies that there are no empty fields
   *
   * @param {any} req has in the body a username and a password
   * @param {any} res
   * @param {any} next moves on to the next handler
   * @returns
   */
  function fieldChecks(req, res, next) {
    return new Promise((resolve, reject) => {
      if (!req.body.username) {
        let err = errorHandler.createOperationalError(
          "Please input a username",
          401
        );
        reject(err);
        return;
      } else if (!req.body.password) {
        let err = errorHandler.createOperationalError(
          "Please input a password",
          401
        );
        err.status = 401;
        reject(err);
      } else {
        resolve(true);
      }
    });
  }

