// ================= Initializations ===============

"use strict";

const router = require("express").Router(),
  passport = require("passport"),
  authenticate = require("./controllers/userLogin").authenticate,
  createUser = require("./controllers/userSignup").createUser,
  getAllUsers = require("./admin/userGetAllUsers").getAllUsers,
  deleteUser = require("./admin/userDeleteUser").deleteUser,
  updateAccountInformation = require("./controllers/userUpdateAccount")
    .updateAccountInformation,
  getUser = require("./controllers/userGetUser").getUser,
  changePassword = require("./controllers/userChangePassword").changePassword;

// ================= Routes ===============
router.route("/login").post(authenticate);

router.route("/signup").post(createUser);

router
  .route("/users")
  .get(passport.authenticate("jwt", { session: false }), getAllUsers);

router
  .route("/users/:userId")
  .delete(passport.authenticate("jwt", { session: false }), deleteUser)
  .put(
    passport.authenticate("jwt", { session: false }),
    updateAccountInformation
  )
  .get(passport.authenticate("jwt", { session: false }), getUser);

router
  .route("/changePassword/:userId")
  .put(passport.authenticate("jwt", { session: false }), changePassword);

module.exports = router;
