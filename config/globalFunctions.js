const userModel = require("mongoose").model("User"),
  jwt = require("jsonwebtoken");

//================= Verification ===================

const verifyPassword = function findUser(userData, callback) {
  userModel.findOne({ username: userData.username }, (err, user) => {
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
const getUser = function findUserById(userId, callback) {
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

const isPasswordValid = function checkValidity(password) { 
  let isPasswordValid = true;
  //parse password
  if(password > 160)
  isPasswordValid = false;
  if(!/\d/.test(password))
  isPasswordValid = false;
  if(!/[a-z]/.test(password))
  isPasswordValid = false;
  if(!/[A-Z]/.test(password))
  isPasswordValid = false;
  if(/[^0-9a-zA-Z]/.test(password))
  isPasswordValid = false;

  return isPasswordValid
}


//================ Decode =========================

const getIdFromToken = function decodeToken(token){
  return jwt.decode(token).id
}


exports.isAdmin = isAdmin;
exports.getUser = getUser;
exports.verifyPassword = verifyPassword;
exports.isPasswordValid = isPasswordValid;
