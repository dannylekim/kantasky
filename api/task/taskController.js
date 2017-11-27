// ============== Initializations ===============

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil");

// ==================== Functions =================

//very heavy function. Rethink this when you can because it is a triple database call with a triple nested for loop
//Either there's a solution in terms of the implementation of the api or the database model
//FIXME: Test and maybe redo Logic
exports.getUsersTask = async (req, res, next) => {
  try {
    //Check if the user exists
    let foundUser = await user.findOne({ _id: req.params.userId });

    //verify is not in db
    if(!foundUser){
      const err = errorHandler.createOperationalError("User does not exist in the database", 500)
      next(err)
      return
    }

    if (!user.groups) {
      //check if has groups at all
      const err = errorHandler.createOperationalError("User has no tasks");
      next(err);
    }
    let groupIds = []; //pull all the ids
    for (groups of user.groups) {
      groupIds.push(groups.groupId);
    }
    usersGroups = await group.find({ _id: { $in: groupIds } }); //request for all groups
    let usersTasks = [];

    //for each task in each single user where this user is, push into the users tasks
    for (group of groups) {
      for (groupUser of group.user) {
        if (groupUser.id === user.id) {
          userTasks.push(groupUser.taskId);
        }
      }
    }
    //find all the tasks and send
    let allTasks = await task.find({ _id: { $in: userTasks } });
    res.send(allTasks);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

//TODO: TEST
/**
 * Gets all the user's tasks in the specified group
 * 
 * @param {any} res params are groupId and userId
 * @param {any} req returns all tasks
 * @param {any} next errorHandler
 */
exports.getUsersTasksInGroup = async (res, req, next) => {
  try {
    const foundGroup = await group.findOne({_id: req.params.groupId})

    //verify if in db
    if(!foundGroup){
      const err = errorHandler.createOperationalError("Group does not exist in the database", 500)
      next(err)
      return
    }


    const userInGroup = foundGroup.users.filter((obj) => { 
      return obj.userId === req.params.userId
    })

    const allTasks = await task.find({_id: {$in: userInGroup.taskId}})
    res.send(allTasks)

  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

//TODO: Test
/**
 * Creates a task inside the specified group
 *
 * @param {any} req parameters contain groupId and userId, body contains the task itself
 * @param {any} res returns the task
 * @param {any} next errorHandler
 * @returns
 */
exports.createTaskInGroup = async (req, res, next) => {
  try {
    //verify both the group and user are valid
    let foundGroup = await group.findOne({ _id: req.params.groupId });

    if(!foundGroup){
      const err = errorHandler.createOperationalError("Group does not exist in the database", 500)
      next(err)
      return
    }

    //verify that the user is in the group
    let userInGroup = foundGroup.users.filter(user => {
      return user.userId === req.params.userId;
    });

    if (!userInGroup) {
      const err = errorHandler.createOperationalError(
        "There is no such user in this group!"
      );
      next(err);
      return;
    }

    req.body.group = req.params.groupId; //is this necessary

    //create task and save it to the database
    let newTask = new task(req.body);
    newTask = await newTask.save();

    //add the task to the groupId specified
    userInGroup.taskId.push(newTask._id);
    foundGroup = await foundGroup.save();

    res.send(foundGroup);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

//TODO: Test and when you change the task ownership change it inside the group as well. Also do not allow groups to be changed.
/**
 * Updates the task.
 *
 * @param {any} req parameters take taskId
 * @param {any} res
 * @param {any} next
 */
exports.updateTask = async (req, res, next) => {
  try {
    await task.findOneAndUpdate({ _id: req.params.taskId }, req.body, {
      new: true
    });
    res.json({ message: "Task has successfully been updated" });
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

//TODO: THE FIXME:
/**
 * Deletes the task in the database and the task from the user in the group.
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.deleteTask = async (req, res, next) => {
  try {

    //verify if task exists
    let foundTask = await task.findOne({ _id: req.params.taskId });
    if(!foundTask){
      const err = errorHandler.createOperationalError("Task does not exist in the database", 500)
      next(err)
      return
    }

    //verify if group exists
    let foundGroup = await group.findOne({ _id: foundTask.group });

    if(!foundGroup){
      const err = errorHandler.createOperationalError("Group does not exist in the database", 500)
      next(err)
      return
    }

    //FIXME: Remove the task from the list of tasks of the user. Perhaps double loop?
    const newGroupUserArray = foundGroup.users.filter(obj => {
      return obj.userId !== foundTask.user;
    });
    foundGroup.users = newGroupUserArray;
    await foundGroup.save();

    //remove the task
    await foundTask.remove();
    res.json({ message: "Task has successfully been removed" });
  } catch (err) {
    (err.isOperational = true), next(err);
  }
};

//=================== Admin Functions =======================
/**
 *  Admin route. Gets all the tasks in the database.
 *
 * @param {any} req
 * @param {any} res Returns all tasks
 * @param {any} next Error Handler
 */
exports.getAllTasks = async (req, res, next) => {
  try {
    await auth.isAdmin(req.get("authorization"));
    const foundTask = await task.find({});
    res.json(foundTask);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};
