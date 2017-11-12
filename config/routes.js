const userRoutes = require("../api/user/userRoutes"),
  taskRoutes = require("../api/task/taskRoutes"),
  router = require("express").Router();

router.use(userRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
