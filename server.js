// server.js

// Calling required packages
var express        = require('express');
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');     // Allows filling req.body w/ things like POST values: let's us get POST data
var methodOverride = require('method-override'); // Allows HTTP verbs like PUT/DELETE where client doesn't support
var morgan         = require('morgan');          // Logs requests to the console

// Setup
var port = process.env.PORT || 8080;
var app = express();

// Database configuration
var database = require('./config/database');
mongoose.connect(database.url);

// Middleware functionality
app.use(express.static(__dirname + '/public'));   // Cuts explicit path required for public/ files
app.use(morgan('dev'));                           // Logs requests to the console
app.use(bodyParser.urlencoded({extended: true})); // Parses for `urlencoded` bodies: application/x-www-form-urlencoded
app.use(bodyParser.json());                       // Parses for application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // Parse application/vnd.api+json as json
app.use(methodOverride());

// Testing database connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to:", database.url);
});

// Testing middleware concept
// var myMiddleware = function(req, res, next) {
//     console.log('Look at this middleware!');
//     next();
// };
//
// var requestTime = function (req, res, next) {
//     console.log(Date.now());
//     next();
// };
//
// app.use(myMiddleware);
// app.use(requestTime);

// app.get('/home', function(req, res) {
//     console.log("Hello world!");
//     res.sendFile(__dirname + '/public/index.html');
//     console.log(__dirname);
// });

// // Retrieving data middleware
// app.use(express.json());       // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies

// Accessing routes
require('./app/routes')(app);

console.log(__dirname);
// app.use(myMiddleware);
app.listen(port);
