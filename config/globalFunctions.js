const userModel = require("mongoose").model("User"),
  jwt = require("jsonwebtoken");

//================= Verification ===================

const verifyPassword = function(userData, callback) {
  userModel.findOne({ username: userData.username }, (err, user) => {
    console.log(userData.username);
    if (err) {
      callback(err);
    } else if (!user) {
      callback("User is not found");
    } else {
      user.isPasswordValid(userData.password, callback, user);
    }
  });
};

//================= Used for local passport strategy =============
const getUser = function(userId, callback) {
  userModel.findById(userId, (err, user) => {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
};

//================= Authorization =============================

const isAdmin = function(token, callback) {
  token = token.replace("Bearer ", "")
  const user = jwt.decode(token)
  if(user.role[0] !== "admin"){
    callback(new Error("Unauthorized Access. User does not have administrator privileges"))
  }
  else {
    callback(null, true)
  }
};

exports.isAdmin = isAdmin;
exports.getUser = getUser;
exports.verifyPassword = verifyPassword;
