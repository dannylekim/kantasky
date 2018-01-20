// ================= Initializations ===============

"use strict";
const passport = require("passport"),
  router = require("express").Router(),
  getAllGroups = require("./admin/groupGetAllGroups").getAllGroups,
  createGroup = require("./controllers/groupCreateGroup").createGroup,
  getGroup = require("./controllers/groupGetGroup").getGroup,
  updateGroup = require("./controllers/groupUpdateGroup").updateGroup,
  deleteGroup = require("./controllers/groupDeleteGroup").deleteGroup;

// ================= Routes ===============

router
  .route("/")
  .get(passport.authenticate("jwt", { session: false }), getAllGroups);

router
  .route("/:userId")
  .post(passport.authenticate("jwt", { session: false }), createGroup);

router
  .route("/:groupId")
  .get(passport.authenticate("jwt", { session: false }), getGroup)
  .put(passport.authenticate("jwt", { session: false }), updateGroup)
  .delete(passport.authenticate("jwt", { session: false }), deleteGroup);

module.exports = router;
