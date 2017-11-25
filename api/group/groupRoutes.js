// ================= Initializations ===============

"use strict";
const groupController = require("./groupController"),
  passport = require("passport"),
  router = require("express").Router();

// ================= Routes ===============

router
  .route("/")
  .get(
    passport.authenticate("jwt", { session: false }),
    groupController.getAllGroups
  );

router
  .route("/:userId")
  .post(
    passport.authenticate("jwt", { session: false }),
    groupController.createGroup
  );

router
  .route("/:groupId")
  .get(
    passport.authenticate("jwt", { session: false }),
    groupController.getGroup
  )
  .put(
    passport.authenticate("jwt", { session: false }),
    groupController.updateGroup
  )
  .delete(
    passport.authenticate("jwt", { session: false }),
    groupController.deleteGroup
  );

module.exports = router;
