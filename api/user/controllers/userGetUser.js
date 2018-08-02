// ============ Initializations =============

("use strict");

const mongoose = require("mongoose"),
  user = mongoose.model("User"),
  group = mongoose.model("Group"),
  auth = require("../../../utility/authUtil"),
  errorHandler = require("../../../utility/errorUtil"),
  bcrypt = require("bcrypt"),
  config = require("../../../config/config"),
  jwt = require("jsonwebtoken"),
  logger = require("../../../utility/logUtil");

//===============================================


/**
 * Gets a specific user. User can only request his own information
 * 
 * @param {any} req 
 * @param {any} res 
 * @param {any} next 
 */
exports.getUser = async (req,res, next) => { 
    try {
      //check token Id and requested User Id and see if they're the same. 
      let authorizationHeader = req.get("authorization")
      authorizationHeader = authorizationHeader.replace("Bearer ", "")
      let payload = jwt.decode(authorizationHeader)
      const requesterUserId = payload.id 
      const requestedUserId = req.params.userId
      if(requesterUserId !== requestedUserId)
        throw errorHandler.createOperationalError("You do not have permission to view this user's information", 401)
  
      //get user and send
      let foundUser = await user.findOne({_id: requestedUserId})
      if(!foundUser) throw errorHandler.createOperationalError("User does not exist", 403)
  
      //remove password and role. Not for public eyes
      foundUser.password = undefined
      foundUser.role = undefined
      res.send(foundUser)
  
    }
    catch(err) { 
      next(err)
    }
  }


  /**
 * Gets a specific user. Used only for searches, removes their details besides first name, last name and email. Search by email.
 * 
 * @param {any} req 
 * @param {any} res 
 * @param {any} next 
 */
exports.searchUser = async (req,res, next) => { 
  try {
    //get user and send

    const foundUser = await user.findOne({email: req.params.email})
    if(!foundUser) throw errorHandler.createOperationalError("User does not exist", 403)
    const foundGroup = await group.findOne({_id: req.params.groupId})
    if(!foundGroup) throw errorHandler.createOperationalError("Group does not exist", 403)

    let userInGroup = foundGroup.users.find(user =>{
      return user.userId === foundUser.id
    })

    if(userInGroup){
      throw errorHandler.createOperationalError("User is already in this group!", 401)
    }

    const formattedUser = { 
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      email: foundUser.email,
      id: foundUser._id
    }
    res.send(formattedUser)

  }
  catch(err) { 
    next(err)
  }
}