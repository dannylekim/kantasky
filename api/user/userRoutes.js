// ================= Initializations ===============

"use strict";

const userController = require("./userController"),
  router = require("express").Router(),
  passport = require("passport");

// ================= Routes ===============
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
    userController.updateAccountInformation
  );

router
  .route("/changePassword/:userId")
  .put(
    passport.authenticate("jwt", { session: false }),
    userController.changePassword
  );

module.exports = router;
