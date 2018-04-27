// ================= Initializations ===============

("use strict");
const passport = require("passport"),
  router = require("express").Router(),
  getAllGroups = require("./admin/groupGetAllGroups").getAllGroups,
  createGroup = require("./controllers/groupCreateGroup").createGroup,
  getGroup = require("./controllers/groupGetGroup").getGroup,
  updateGroup = require("./controllers/groupUpdateGroup").updateGroup,
  deleteGroup = require("./controllers/groupDeleteGroup").deleteGroup,
  getAllUsersGroups = require("./controllers/groupGetAllUsersGroups")
    .getAllUsersGroups,
  joinGroup = require("./controllers/groupJoinGroup").joinGroup,
  leaveGroup = require("./controllers/groupLeaveGroup").leaveGroup;

// ================= Routes ===============

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), getAllGroups);

router
  .route("/:userId")
  .post(passport.authenticate("jwt", { session: false }), createGroup)
  .get(passport.authenticate("jwt", { session: false }), getAllUsersGroups);

router
  .route("/:groupId")
  .get(passport.authenticate("jwt", { session: false }), getGroup)
  .put(passport.authenticate("jwt", { session: false }), updateGroup)
  .delete(passport.authenticate("jwt", { session: false }), deleteGroup);

router
  .route("/join/:groupId")
  .get(passport.authenticate("jwt", { session: false }), joinGroup);

router
  .route("/leave/:groupId")
  .post(passport.authenticate("jwt", { session: false }), leaveGroup);

module.exports = router;
