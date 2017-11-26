// ================= Initializations ===============

"use strict";
const taskController = require("./taskController"),
  passport = require("passport"),
  router = require("express").Router();

// ================= Schemas ===============

router
  .route("/:userId")
  .get(
    passport.authenticate("jwt", { session: false }),
    taskController.getUsersTask
  );

router
  .route("/:groupId/:userId")
  .post(
    passport.authenticate("jwt", { session: false }),
    taskController.createTaskInGroup
  );

router
  .route("/:taskId")
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
