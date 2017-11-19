//============ Setting up the Express environment ==================

const express = require("express"),
  app = express(),
  Task = require("./api/task/taskModel"),
  User = require("./api/user/userModel"),
  Group = require("./api/group/groupModel"),
  bodyParser = require("body-parser"),
  config = require("./config/config"),
  router = require("./config/routes"),
  passport = require("passport"),
  passportJWT = require("passport-jwt"),
  extractJWT = passportJWT.ExtractJwt,
  jwtStrategy = passportJWT.Strategy,
  morgan = require("morgan"),
  auth = require("./config/authUtil"),
  errorHandler = require("./utility/errorUtil"),
  bcrypt = require("bcrypt");

//============= Express Application Configuration ==========

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);
app.use(function sendResponse(req, res) {
  res
    .status(404)
    .send({ url: req.originalUrl + " is not a valid request URL" });
}); //TODO: send a 404 template

//============ Centralized Error Handler ===================
app.use(function centralizedErrorHandler(err, req, res, next) {
  errorHandler.handleError(err,req,res,next)
});

process.on("uncaughtException", function(err) {
    errorHandler.handleUncaughtException(err)
})

//============ Strategy Configuration ==================
var jwtOptions = {};
jwtOptions.jwtFromRequest = extractJWT.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.secret;

var strategy = new jwtStrategy(jwtOptions, function(jwtPayload, callback) {
  auth.getUser(jwtPayload.id, (err, user) => {
    if (user) {
      callback(null, user);
    } else {
      callback(null, false);
    }
  });
});

passport.use(strategy);

module.exports = app;