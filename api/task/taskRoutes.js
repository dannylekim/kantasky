'use strict'

module.exports = function (app) {
    var taskController = require('./taskController')


//task related Routes

app.route('/tasks')
    .get(taskController.GetAllTasks)
    .post(taskController.CreateTask)

app.route('/tasks/:taskId')
    .get(taskController.GetTask)
    .put(taskController.UpdateTask)
    .delete(taskController.DeleteTask)

}