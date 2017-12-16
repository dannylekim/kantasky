// ============== Initializations ===============

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil"),
  logger = require("../../utility/logUtil");

// ==================== Functions =================

//FIXME: very heavy function. Rethink this when you can because it is a triple database call with a triple nested for loop
/**
 * Get's all of the users tasks in every single group in an array. Requires token
 *
 * @param {any} req needs userId
 * @param {any} res returns array of objects
 * @param {any} next errorHandler
 */
exports.getUsersTask = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Starting Get User's Tasks =============",
    ""
  );
  try {
    //Check if the user exists
    let foundUser = await user.findOne({ _id: req.params.userId });

    //verify is not in db
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User does not exist in the database",
        500
      );
      throw err;
    }

    if (!foundUser.groups) {
      //check if has groups at all
      const err = errorHandler.createOperationalError(
        "User does not have any groups"
      );
      throw err;
    }

    logger.log(
      "info",
      "group.find()",
      "Create array of group Ids and push in to database call",
      ""
    );
    let groupIds = []; //pull all the ids
    for (let groups of foundUser.groups) {
      groupIds.push(groups.groupId);
    }
    let usersGroups = await group.find({ _id: { $in: groupIds } }); //request for all groups
    let usersTasks = [];

    logger.log(
      "info",
      "task.find()",
      "Going through each and every single one of users groups and concat to one array to find tasks",
      ""
    );
    //for each task in each single user where this user is, push into the users tasks
    for (let groupOfUser of usersGroups) {
      for (let groupUser of groupOfUser.users) {
        if (groupUser.userId === req.params.userId) {
          usersTasks = usersTasks.concat(groupUser.taskId);
        }
      }
    }

    //find all the tasks and send
    let allTasks = await task.find({ _id: { $in: usersTasks } });

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Finished Get User's Tasks =============",
      ""
    );
    res.send(allTasks);
  } catch (err) {
    next(err);
  }
};

/**
 * Gets all the user's tasks in the specified group
 *
 * @param {any} res params are groupId and userId
 * @param {any} req returns all tasks
 * @param {any} next errorHandler
 */
exports.getUsersTasksInGroup = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Starting Get User's in Tasks Groups =============",
    ""
  );

  try {
    const foundGroup = await group.findOne({ _id: req.params.groupId });
    const requesterId = await auth.getIdFromToken(
      req.get("authorization").replace("Bearer ", "")
    );

    //verify if in db
    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database",
        500
      );
      throw err;
    }

    //find requester in the group
    let userInGroup = foundGroup.users.filter(obj => {
      return obj.userId === requesterId;
    });

    userInGroup = userInGroup[0];

    if (!userInGroup) {
      const err = errorHandler.createOperationalError(
        "Requester does not exist within the group"
      );
      throw err;
    }

    //find user in the group --> it's kinda like duplicate code. Find a way to merge above
    userInGroup = foundGroup.users.filter(obj => {
      return obj.userId === req.params.userId;
    });

    logger.log(
      "info",
      "task.find()",
      "Finding Tasks from that User in the group",
      ""
    );
    userInGroup = userInGroup[0];

    if (!userInGroup) {
      const err = errorHandler.createOperationalError(
        "User does not exist within the group"
      );
      throw err;
    }

    const allTasks = await task.find({ _id: { $in: userInGroup.taskId } });

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Finished Get User's in Tasks Groups =============",
      ""
    );
    res.send(allTasks);
  } catch (err) {
    next(err);
  }
};

/**
 * Creates a task inside the specified group
 *
 * @param {any} req parameters contain groupId and userId, body contains the task itself
 * @param {any} res returns the task
 * @param {any} next errorHandler
 * @returns
 */
exports.createTaskInGroup = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Starting Create Task In Group =============",
    ""
  );
  try {
    //verify both the group and user are valid
    let foundGroup = await group.findOne({ _id: req.params.groupId });

    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database",
        500
      );
      throw err;
    }

    //verify that the user is in the group
    let userInGroup = foundGroup.users.filter(user => {
      return user.userId === req.params.userId;
    });

    userInGroup = userInGroup[0];

    if (!userInGroup) {
      const err = errorHandler.createOperationalError(
        "There is no such user in this group!"
      );
      throw err;
    }

    //set ownership
    req.body.group = req.params.groupId;
    req.body.user = req.params.userId;

    //create task and save it to the database
    let newTask = new task(req.body);

    logger.log("info", "newTask.save()", "Saving into the database", "");
    newTask = await newTask.save();

    //add the task to the groupId specified
    userInGroup.taskId.push(newTask._id);
    foundGroup = await foundGroup.save();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Created Task in Group =============",
      ""
    );
    res.send(foundGroup);
  } catch (err) {
    next(err);
  }
};

//TODO: Test
/**
 * Updates the task.
 *
 * @param {any} req parameters take taskId
 * @param {any} res
 * @param {any} next
 */
exports.updateTask = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Update Task =============",
    ""
  );

  try {
    //groups can not be changed so undefined it if it's there
    req.body.group = undefined;

    const reqId = auth.getIdFromToken(
      req.get("authorization").replace("Bearer ", "")
    );

    //check if it's the correct and non empty task
    let foundTask = await task.findOne({ _id: req.params.taskId });
    if (!foundTask)
      throw errorHandler.createOperationalError(
        "The task does not exist.",
        500
      );

    if (foundTask.user !== reqId) {
      throw errorHandler.createOperationalError(
        "Only the task's user can update his own tasks.",
        401
      );
    }

    //check if it's correct user
    if (req.body.user) {
      const foundUser = await user.findOne({ _id: req.body.user });
      if (!foundUser)
        throw errorHandler.createOperationalError(
          "The new user does not exist.",
          500
        );

      //check if it's the correct group
      const foundGroup = await group.findOne({ _id: foundTask.group });
      if (!foundGroup)
        throw errorHandler.createOperationalError(
          "The group does not exist.",
          500
        );

      //get the two users to swap ownership of the task
      let usersToChangeOwnerShip = foundGroup.users.filter(user => {
        return user.userId === req.body.user || user.userId === foundTask.user;
      });

      if (
        usersToChangeOwnerShip.length < 1 ||
        usersToChangeOwnerShip.length > 2
      )
        throw errorHandler.createOperationalError(
          "Users not found to update.",
          500
        );

      //swap. Is it better to just filter out what isn't the task vs splicing it out.
      if (usersToChangeOwnerShip.length === 2) {
        logger.log("info", "Swap", "Swapping Ownershp", "");
        if (usersToChangeOwnerShip[0].userId === req.body.user) {
          usersToChangeOwnerShip[0].taskId.push(req.params.taskId);
          const indexOfTask = usersToChangeOwnership[1].taskId.indexOf(
            foundTask.user
          );
          usersToChangeOwnerShip[1].taskId = usersToChangeOwnerShip[1].taskId.splice(
            indexOfTask,
            1
          );
        } else {
          usersToChangeOwnerShip[1].taskId.push(req.params.taskId);
          const indexOfTask = usersToChangeOwnership[0].taskId.indexOf(
            foundTask.user
          );
          usersToChangeOwnerShip[0].taskId = usersToChangeOwnerShip[0].taskId.splice(
            indexOfTask,
            1
          );
        }
        await usersToChangeOwnerShip[0].save();
        await usersToChangeOwnerShip[1].save();
      }
    }

    logger.log("info", "task.findOneAndUpdate()", "Update the task", "");
    await task.findOneAndUpdate({ _id: req.params.taskId }, req.body, {
      new: true
    });

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Update Task =============",
      ""
    );
    res.json({ message: "Task has successfully been updated" });
  } catch (err) {
    next(err);
  }
};

//TODO:TEST
/**
 * Deletes the task in the database and the task from the user in the group.
 *
 * @param {any} req
 * @param {any} res
 * @param {any} next
 */
exports.deleteTask = async (req, res, next) => {
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Delete Task =============s",
    ""
  );
  try {
    //verify if task exists
    let foundTask = await task.findOne({ _id: req.params.taskId });
    if (!foundTask) {
      const err = errorHandler.createOperationalError(
        "Task does not exist in the database",
        500
      );
      throw err;
    }

    //verify if group exists
    let foundGroup = await group.findOne({ _id: foundTask.group });

    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database",
        500
      );
      throw err;
    }

    logger.log(
      "info",
      "Bulk Edit all groups and users",
      "Check all groups with user inside for that one task and remove it all.",
      ""
    );
    let isUserFound = false;
    for (let user of foundGroup.users) {
      if (user.userId === foundTask.user) {
        const index = user.taskId.indexOf(req.params.taskId);
        if (index <= -1)
          throw errorHandler.createOperationalError(
            "Task not found in group",
            500
          );
        user.taskId = user.taskId.splice(index, 1);
        isUserFound = true;
        break;
      }
    }
    if (isUserFound) await foundGroup.save();
    else
      throw errorHandler.createOperationalError(
        "User was not found in group",
        500
      );

    //remove the task

    logger.log("info", "foundTask.remove()", "Removing Tasks", "");
    await foundTask.remove();

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Delete Task =============",
      ""
    );
    res.json({ message: "Task has successfully been removed" });
  } catch (err) {
    next(err);
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
  logger.log(
    "info",
    req.method + " " + req.baseUrl + req.url,
    "============= Started Get All Tasks =============",
    ""
  );
  try {
    await auth.isAdmin(req.get("authorization"));
    const foundTask = await task.find({});

    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Successfully Finished Get All Tasks =============",
      ""
    );
    res.json(foundTask);
  } catch (err) {

    next(err);
  }
};
