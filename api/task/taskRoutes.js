"use strict";
const taskController = require("./taskController"),
  passport = require("passport"),
  router = require("express").Router();

router
  .route("/:userId")
  .get(
    passport.authenticate("jwt", { session: false }),
    taskController.getUsersTasks
  )
  .post(
    passport.authenticate("jwt", { session: false }),
    taskController.createTask
  );

router
  .route("/:taskId")
  .get(passport.authenticate("jwt", { session: false }), taskController.getTask)
  .put(
    passport.authenticate("jwt", { session: false }),
    taskController.updateTask
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    taskController.deleteTask
  );

router
  .route("/")
  .get(
    passport.authenticate("jwt", { session: false }),
    taskController.getAllTasks
  );

module.exports = router;
