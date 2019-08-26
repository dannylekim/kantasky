//============ Setting up the Express environment ==================

const express = require("express"),
  app = express(),
  server = require("http").Server(app),
  io = require("socket.io")(server),
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
  auth = require("./utility/authUtil"),
  errorHandler = require("./utility/errorUtil"),
  cors = require("cors"),
  bcrypt = require("bcrypt"),
  {setupIO} = require("./utility/socketUtil"),
  logger = require("./utility/logUtil");

//============= Express Application Configuration ==========

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
// app.use(logger.loggerMiddleware);
app.use("/", router);

//============ Centralized Error Handler ===================

app.use(errorHandler.handleError);
process.on("uncaughtException", function(err) {
  errorHandler.handleUncaughtException(err);
});

//============ Strategy Configuration ==================
let jwtOptions = {};
jwtOptions.jwtFromRequest = extractJWT.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.secret;

let strategy = new jwtStrategy(jwtOptions, function(jwtPayload, callback) {
  auth.getUser(jwtPayload.id, (err, user) => {
    if (user) {
      callback(null, user);
    } else {
      callback(null, false);
    }
  });
});

io.on("connection", client => {
  setupIO(client);
});

passport.use(strategy);

module.exports = { server, io };
