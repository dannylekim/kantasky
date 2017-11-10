const strategy = require("passport-local").strategy,
  user = require("../api/user/userModel");

module.exports = function(passport) {
  // ==========================================
  // passport session setup ===================
  // ==========================================

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  /** ====================================
     *  Signup =============================
     *  ===================================
     */
};
