const {server} = require("../app"),
  mongoose = require("mongoose"),
  config = require("../config/config"),
  MongoClient = require("mongodb").MongoClient;

//======== Database Configuration =======================
mongoose.Promise = global.Promise;
mongoose.connect(config.database, {
  useMongoClient: true
}); //database connection

//=============== Start the Server =====================

const port = process.env.PORT || 4000;
server.listen(port);
console.log("Kantasky Server started on port: " + port);

