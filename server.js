//============ Setting up the environment ==================

//TODO: use Prettier
const express = require('express'),
    app = express(),
    port = process.env.PORT || 4000,
    mongoose = require('mongoose'),
    Task = require('./api/task/taskModel'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    config = require('./config'),
    routes = require('./api/task/taskRoutes'),
    passport = require('passport'),
    morgan = require('morgan'),
    cookieParser = require('cookie-parser'),
    session = require('express-session')

//======== Database Configuration =======================
const promise = mongoose.connect(config.database, {
    useMongoClient: true,
}) //database connection

//============= Express Application Configuration ==========
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use(session(config.secret))
app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res) {
    res.status(404).send({ url: req.originalUrl + "is not a valid request URL" })
}) 


//=============== Start the Server =====================
routes(app)
app.listen(port)
console.log('Server started on port: ' + port)
