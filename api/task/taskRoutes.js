"use strict";
const taskController = require("./taskController"),
  router = require("express").Router();

router.route("/")
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route("/:taskId")
  .get(taskController.getTask)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
