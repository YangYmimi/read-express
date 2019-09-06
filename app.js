var express = require('express');
var app = express();

var welcome = require('./routes/welcome');

app.use(express.json()); // based on body-parser

app.use(welcome);

module.exports = app;

