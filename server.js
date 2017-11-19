//============ Setting up the Express environment ==================

//TODO: Set this in APP.JS
const express = require("express"),
  app = express(),
  port = process.env.PORT || 4000,
  mongoose = require("mongoose"),
  Task = require("./api/task/taskModel"),
  User = require("./api/user/userModel"),
  Group = require("./api/group/groupModel"),
  bodyParser = require("body-parser"),
  MongoClient = require("mongodb").MongoClient,
  config = require("./config/config"),
  router = require("./config/routes"),
  passport = require("passport"),
  passportJWT = require("passport-jwt"),
  extractJWT = passportJWT.ExtractJwt,
  jwtStrategy = passportJWT.Strategy,
  morgan = require("morgan"),
  auth = require("./config/authUtil"),
  bcrypt = require("bcrypt");

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

//======== Database Configuration =======================
mongoose.Promise = global.Promise;
mongoose.connect(config.database, {
  useMongoClient: true
}); //database connection

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
  if(!err.isOperational){
    //log
    res.send(err)
    //process exit
  }
  res.send(err);
});

//=============== Start the Server =====================

app.listen(port);
console.log("Server started on port: " + port);

// ===================  Catching Uncaught Errors ===================

// FIXME: This should be freeing up resources, and all handlers and then restart the application and print the stack trace.
process.on("uncaughtException", function(err) {
  // handle the error safely

  if(!err.isOperational){
    console.log(err);
    process.exit(1);
  }
 
});
