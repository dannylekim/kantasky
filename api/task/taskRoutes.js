"use strict";
const taskController = require("./taskController"),
  passport = require("passport"),
  config = require("../../config/config"),
  jwt = require("jsonwebtoken"),
  router = require("express").Router();

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), taskController.getAllTasks)
  .post(passport.authenticate("jwt", { session: false }), taskController.createTask);

router
  .route("/:taskId")
  .get(passport.authenticate("jwt", { session: false }),taskController.getTask)
  .put(passport.authenticate("jwt", { session: false }),taskController.updateTask)
  .delete(passport.authenticate("jwt", { session: false }),taskController.deleteTask);

module.exports = router;
