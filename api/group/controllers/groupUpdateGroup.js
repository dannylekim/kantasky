// ============ Initializations ================

"use strict";

const mongoose = require("mongoose"),
  task = mongoose.model("Task"),
  group = mongoose.model("Group"),
  user = mongoose.model("User"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  logger = require("../../../utility/logUtil");


//TODO: TEST -- SEEMS TO WORK
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
    logger.log(
      "info",
      req.method + " " + req.baseUrl + req.url,
      "============= Started Update Group =============",
      ""
    );
  
    const token = req.get("authorization").replace("Bearer ", "");
    const tokenId = auth.getIdFromToken(token);
    //updating variables
    let newGroupInformation = {};
    if (req.body.name) newGroupInformation.name = req.body.name;
    req.body.category = undefined; // can't change category of a group
  
    try {
      if (req.body.users) {
        newGroupInformation.users = req.body.users;
        //accumulate all the user Ids
  
        logger.log("info", "get reqUser.userId", "Get all user IDs", "");
        let reqUsers = [];
        for (let reqUser in req.body.users) {
          reqUsers.push(reqUser.userId);
        }
  
        //check if general is there, if no throw error
  
        logger.log(
          "info",
          "General User Check",
          "Check if general user is still present",
          ""
        );
        const generalIndex = reqUsers.indexOf("General");
        if (generalIndex > -1) reqUsers = reqUsers.splice(generalIndex, 1);
        else
          throw errorHandler.createOperationalError(
            "You can not remove General from list of users in a group",
            401
          );
  
        const reqUsersList = await user.find({ _id: { $in: reqUsers } });
        //check if all users are in the db
  
        logger.log(
          "info",
          "Check for Users in DB",
          "Check that all users are in the db",
          ""
        );
        if (reqUsersList.length !== req.body.users.length)
          throw errorHandler.createOperationalError(
            "Error in list of users: Not all users exist"
          );
      }
  
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
  
      logger.log(
        "info",
        "push()",
        "Accumulate all users inside the group in the db",
        ""
      );
      let dbUserList = [];
      for (let dbUser in foundGroup.users) {
        dbUserList.push(dbUser.userId);
      }
  
      //check if req.body.users is a subset of the groups users
  
      logger.log(
        "info",
        "every => indexOf() for subset",
        "Verify that all users in the request belong to the subset of Group's Users",
        ""
      );
      if (req.body.users) {
        const isSubSet = reqUsers.every(function(val) {
          return dbUserList.indexOf(val) >= 0;
        });
        if (!isSubset)
          throw errorHandler.createOperationalError(
            "List of users do not all belong in the group!"
          );
      }
  
      //if leaderId is filled, check if it's a valid user and fill the obj appropriately
  
      if (req.body.leaderId) {
        logger.log(
          "info",
          "findOne(), setNewObj",
          "Verify if updated TeamLeader is an existing teamLeader",
          ""
        );
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
  
      logger.log("info", "Saving/Update the group", "Updating the group", "");
      foundGroup.set(newGroupInformation);
      foundGroup = await foundGroup.save();
  
      logger.log(
        "info",
        req.method + " " + req.baseUrl + req.url,
        "============= Successfully Finished Update Group =============",
        ""
      );
      res.json({ message: "Successfully updated the group!" });
    } catch (err) {
      next(err);
    }
  };