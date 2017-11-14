//============ Setting up the Express environment ==================

//TODO: Set this in APP.JS 
const express = require("express"),
  app = express(),
  port = process.env.PORT || 4000,
  mongoose = require("mongoose"),
  Task = require("./api/task/taskModel"),
  User = require("./api/user/userModel"),
  bodyParser = require("body-parser"),
  MongoClient = require("mongodb").MongoClient,
  config = require("./config/config"),
  router = require("./config/routes"),
  passport = require("passport"),
  passportJWT = require("passport-jwt"),
  extractJWT = passportJWT.ExtractJwt,
  jwtStrategy = passportJWT.Strategy,
  morgan = require("morgan"),
  auth = require("./config/globalFunctions")
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

//TODO: Look up serialize/deserialize user and verify if it's useful at all

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
app.use(function(req, res) {
  res
    .status(404)
    .send({ url: req.originalUrl + " is not a valid request URL" });
}); //TODO: send a 404 template

//=============== Start the Server =====================

app.listen(port);
console.log("Server started on port: " + port);

//TODO: Create a router js that describes the routes
