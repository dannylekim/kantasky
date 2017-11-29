// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../utility/authUtil"),
  errorHandler = require("../../utility/errorUtil");

// ============== Functions ===================
/**
 * Gets the group specified by the param groupId
 *
 * @param {any} req
 * @param {any} res returns the found group
 * @param {any} next errorHandler
 */
exports.getGroup = async (req, res, next) => {
  try {
    const foundGroup = await group.find({ _id: req.params.groupId });

    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database",
        500
      );
      throw err;
    }
    res.json(foundGroup);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

/**
 * Creates a group and adds the group to the user Id
 *
 * @param {any} req takes in Name, and Category type in body. Params must have userId
 * @param {any} res returns the new group
 * @param {any} next error handler
 */
exports.createGroup = async (req, res, next) => {
  try {
    //initialize body and all necessary values
    let foundUser = await user.findOne({ _id: req.params.userId });
    99.784;
    //if user doesn't exist, return
    if (!foundUser) {
      const err = errorHandler.createOperationalError(
        "User does not exist in the database!",
        500
      );
      throw err;
    }

    req.body.users = [{ userId: req.params.userId, taskId: [] }];
    if (req.body.category === "group")
      req.body.users.push({ userId: "general", taskId: [] });
    req.body.teamLeader = {
      leaderId: req.params.userId,
      name: foundUser.firstName + " " + foundUser.lastName
    };

    //save the group to the database
    let newGroup = new group(req.body);
    newGroup = await newGroup.save();

    //push the group to the user
    const groupObj = {
      category: req.body.category,
      groupId: newGroup["_id"]
    };
    const updatedUser = foundUser.groups.push(groupObj);

    //set and save
    foundUser.set(updatedUser);
    foundUser = await foundUser.save();
    res.json(newGroup);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

//TODO: TEST also FIXME: THIS IS SUCH A HEAVY FUNCTION, --> only teamleader can delete the group/admin
exports.deleteGroup = async (req, res) => {
  try {
    const foundGroup = await group.find({ _id: req.params.groupId });
    if (!foundGroup)
      throw errorHandler.createOperationalError(
        "Group doesn't exist in database",
        500
      );

    let usersList = [];
    let tasksList = [];
    for (let groupUser of foundGroup.users) {
      usersList.push(groupUser.userId);
      tasksList.push(groupUser.taskId);
    }

    const foundUsers = await user.find({ _id: { $in: usersList } });
    if (foundUsers.length !== usersList.length)
      throw errorHandler("Error in how many users in group vs database");
    for (let groupUser in foundUsers) {
      for (let index = 0; i < groupUser.groups.length; i++) {
        if (req.params.id === groupUser.groups[index].groupId) {
          groupUser.groups = groupUser.groups.splice(i, 1);
          await groupUser.save();
          break;
        }
      }
    }
    await task.remove({ _id: { $in: tasks } });
    await group.remove({ _id: req.params.groupId });
    res.json({ message: "Group has successfully been removed" });
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};

//TODO: TEST
/**
 * Updates the group. The fields edited are teamLeader, Users and the group name. Changing team Leader and Users requires that
 * the group is category group and that the requester is a team leader.
 *
 * @param {any} req Team Leader, users and group name are in the body. Params is group Id
 * @param {any} res returns a message indicating that the group has been updated
 * @param {any} next error handler
 * @returns
 */
exports.updateGroup = async (req, res, next) => {
  const token = req.get("authorization").replace("Bearer ", "");
  const tokenId = auth.getIdFromToken(token);
  //updating variables
  let newGroupInformation = {};
  if (req.body.name) newGroupInformation.name = req.body.name;
  if (req.body.users) newGroupInformation.users = req.body.users;

  //accumulate all the user Ids
  let reqUsers = [];
  for (let reqUser in req.body.users) {
    reqUsers.push(reqUser.userId);
  }

  //check if general is there, if no throw error
  const generalIndex = reqUsers.indexOf("General");
  if (generalIndex > -1) reqUsers = reqUsers.splice(generalIndex, 1);
  else
    throw errorHandler.createOperationalError(
      "You can not remove General from list of users in a group",
      401
    );

  try {
    const reqUsersList = await user.find({ _id: { $in: reqUsers } });
    //check if all users are in the db
    if (reqUsersList.length !== req.body.users.length)
      throw errorHandler.createOperationalError(
        "Error in list of users: Not all users exist"
      );

    //does the group exist
    let foundGroup = await group.findOne({ _id: req.params.groupId });

    if (!foundGroup) {
      const err = errorHandler.createOperationalError(
        "Group does not exist in the database!",
        500
      );
      throw err;
    }

    //accumulate
    let dbUserList = [];
    for (let dbUser in foundGroup.users) {
      dbUserList.push(dbUser.userId);
    }

    //check if req.body.users is a subset of the groups users
    const isSubSet = reqUsers.every(function(val) {
      return dbUserList.indexOf(val) >= 0;
    });
    if (!isSubset)
      throw errorHandler.createOperationalError(
        "List of users do not all belong in the group!"
      );

    //if leaderId is filled, check if it's a valid user and fill the obj appropriately
    if (req.body.leaderId) {
      const foundLeader = await user.findOne({
        _id: req.body.leaderId
      });

      //does that leader exist
      if (!foundLeader) {
        const err = errorHandler.createOperationalError(
          "Leader does not exist!",
          500
        );
        throw err;
      }
      newGroupInformation.teamLeader = {
        name: foundLeader.firstName + " " + foundLeader.lastName,
        leaderId: foundLeader._id
      };
    }

    //if all empty fields, reject
    if (!(req.body.users || req.body.name || req.body.leaderId)) {
      const err = errorHandler.createOperationalError(
        "You need to change at least one thing!"
      );
      throw err;
    }

    //If it isn't the team leader who's updated, reject request
    if (foundGroup.teamLeader.leaderId !== tokenId) {
      const err = errorHandler.createOperationalError(
        "Only the Team Leader can update the group!"
      );
      throw err;
    }

    //if the group is personal, you should not be allowed to update users or the team leader.
    if (foundGroup.category === "personal") {
      newGroupInformation.teamLeader = foundGroup.teamLeader;
      newGroupInformation.users = foundGroup.users;
    }

    //set and save
    foundGroup.set(newGroupInformation);
    foundGroup = await foundGroup.save();
    res.json({ message: "Successfully updated the group!" });
  } catch (err) {
    (err.isOperational = true), next(err);
  }
};

exports.leaveGroup = async (req, res, next) => {
  
}

//============= Admin Functions =================
/**
 * Admin route. Gets all the groups in the database.
 *
 * @param {any} req
 * @param {any} res
 */
exports.getAllGroups = async (req, res) => {
  try {
    await auth.isAdmin(req.get("authorization"));
    const foundGroups = await group.find({});
    res.send(foundGroups);
  } catch (err) {
    err.isOperational = true;
    next(err);
  }
};
