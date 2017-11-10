"use strict";

module.exports = function(app) {
  const taskController = require("./taskController");

  //task related Routes

  app
    .route("/tasks")
    .get(taskController.getAllTasks)
    .post(taskController.createTask);

  app
    .route("/tasks/:taskId")
    .get(taskController.getTask)
    .put(taskController.updateTask)
    .delete(taskController.deleteTask);
};
