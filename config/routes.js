// ================= Initializations ===============

const userRoutes = require("../api/user/userRoutes"),
  taskRoutes = require("../api/task/taskRoutes"),
  groupRoutes = require("../api/group/groupRoutes"),
  router = require("express").Router();

// ================= Routes ===============

router.use(userRoutes);
router.use("/tasks", taskRoutes);
router.use("/groups", groupRoutes);

module.exports = router;
