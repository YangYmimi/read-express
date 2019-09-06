var express = require('express');
var app = express();

app.get('/welcome', function(req, res, next) {
  res.send('Hello World');
});

module.exports = app;
