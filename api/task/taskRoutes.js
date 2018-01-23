// ================= Initializations ===============

"use strict";
const passport = require("passport"),
  router = require("express").Router(),
  getUsersTasks = require("./controllers/taskGetUsersTask").getUsersTask,
  createTaskInGroup = require("./controllers/taskCreateTaskInGroup")
    .createTaskInGroup,
  getUsersTasksInGroup = require("./controllers/taskGetUsersTasksInGroup")
    .getUsersTasksInGroup,
  updateTask = require("./controllers/taskUpdateTask").updateTask,
  deleteTask = require("./controllers/taskDeleteTask").deleteTask,
  getAllTasks = require("./admin/taskGetAllTasks").getAllTasks;

// ================= Schemas ===============

router
  .route("/:userId")
  .get(passport.authenticate("jwt", { session: false }), getUsersTasks);

router
  .route("/:groupId/:userId")
  .post(passport.authenticate("jwt", { session: false }), createTaskInGroup)
  .get(passport.authenticate("jwt", { session: false }), getUsersTasksInGroup);

router
  .route("/:taskId")
  .put(passport.authenticate("jwt", { session: false }), updateTask)
  .delete(passport.authenticate("jwt", { session: false }), deleteTask);

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), getAllTasks);

module.exports = router;
