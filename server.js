//TODO: move to app.js after
//TODO: use Prettier
var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000,
    mongoose = require('mongoose'),
    Task = require('./api/task/taskModel'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://bloopig:goobypls@testenvironment-shard-00-00-inaik.mongodb.net:27017,testenvironment-shard-00-01-inaik.mongodb.net:27017,testenvironment-shard-00-02-inaik.mongodb.net:27017/test?ssl=true&replicaSet=TestEnvironment-shard-0&authSource=admin"


//do your error handlings with promises rather than callbacks
var promise = mongoose.connect(uri, {
    useMongoClient: true,
})

app.use(bodyParser.urlencoded({extended: true})),
app.use(bodyParser.json())

var routes = require('./api/task/taskRoutes')
routes(app)

app.listen(port)

app.use(function (req, res){
    res.status(404).send({url: req.originalUrl + "is not a valid request URL"})
})

console.log('Server started on port: ' + port)
