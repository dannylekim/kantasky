"use strict";

const userController = require("./userController"),
  router = require("express").Router(),
  passport = require("passport");

router
  .route("/login")
  .post(userController.authenticate)
  .get(function(req, res) {
    res.status(200).json("TODO: SEND LOGIN PAGE");
  });

router
  .route("/signup")
  .get(function(req, res) {
    res.status(200).json("TODO: SEND SIGNUP PAGE");
  })
  .post(userController.createUser);

router.route("/main").get(function(req, res) {
  res.status(200).json("TODO: SEND MAIN PAGE");
});

router
  .route("/users")
  .get(
    passport.authenticate("jwt", { session: false }),
    userController.getAllUsers
  );

router
  .route("/users/:userId")
  .delete(
    passport.authenticate("jwt", { session: false }),
    userController.deleteUser
  )
  .put(
    passport.authenticate("jwt", { session: false }),
    userController.updateUser
  );

router
  .route("/changePassword")
  .put(
    passport.authenticate("jwt", { session: false }),
    userController.changePassword
  );

router
  .route("/updateAccount")
  .put(
    passport.authenticate("jwt", { session: false }),
    userController.updateUser
  );

module.exports = router;
