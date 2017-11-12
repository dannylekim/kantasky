userModel = require("mongoose").model("User");

//================= Verification ===================

const verifyPassword = function(userData, callback) {
  userModel.findOne({ username: userData.username }, (err, user) => {
    console.log(userData.username);
    if (err) {
      callback(err);
    } else if (!user) {
      callback("User is not found");
    } else {
      user.isPasswordValid(userData.password, callback, user.id);
    }
  });
};

const getUser = function (userId, callback) {
  userModel.findById(userId, (err, user) => {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
}
exports.getUser = getUser
exports.verifyPassword = verifyPassword;
