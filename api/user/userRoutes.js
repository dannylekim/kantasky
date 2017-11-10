module.exports = function(app, passport) {
  const userController = require("./userController");

  app
    .route("/login")
    //.get template
    .post(userController.login);
};
