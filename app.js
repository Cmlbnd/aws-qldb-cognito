//needed for amazon-cognito-identity-js
global.fetch = require('node-fetch');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

const authConfig = require('./config/authentication');
const registeredUsers = require('./config/users');
const jwt_decode = require('jwt-decode');

var authAPI = require('./controller/authenticationApi');

var app = express();
app.use(logger('dev'));

app.use(function (req, res, next) {
  var bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    req.bearerToken = token;
    const decodedToken = jwt_decode(token);
    req.externalId = decodedToken.sub;
    console.log("req.externalId: ", req.externalId)
    
    req.roles = decodedToken["cognito:groups"];
  }
  next();
});


// cors
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

console.log("Will get all users using admin connection");
registeredUsers.setRegisteredUsers();


// Auth API
app.use("/api/v1/auth", authAPI);

// support React code
app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
