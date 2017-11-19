const app = require("../app"),
  mongoose = require("mongoose"),
  config = require("../config/config");
MongoClient = require("mongodb").MongoClient;

//======== Database Configuration =======================
mongoose.Promise = global.Promise;
mongoose.connect(config.database, {
  useMongoClient: true
}); //database connection

//=============== Start the Server =====================

const port = process.env.PORT || 4000;
app.listen(port);
console.log("Team Organizer Server started on port: " + port);
