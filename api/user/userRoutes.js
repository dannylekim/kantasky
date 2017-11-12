"use strict";

const userController = require("./userController"),
  router = require("express").Router(),
  passport = require("passport");

router
  .route("/login")
  //.get template
  .post(userController.authenticate)
  .get(passport.authenticate("jwt", { session: false }), function(req, res) {
    res.status(200).json("Success! You can not see this without a token");
  });

router.route("/signup").post(userController.createUser);

router.route("/users").get(userController.getAllUsers);

router.route("/users/:userId").delete(userController.deleteUser)

module.exports = router;
