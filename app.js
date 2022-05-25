
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser');
// const router = require('./routes/router');
const expressValidator = require('express-validator');
var path = require('path');
var dotenv = require('dotenv');
dotenv.config();

var app = express();
const _db = require('./database');
const _router = require('./router');
// const _cron = require('./cron');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('__dirname', __dirname);

app.use(express.static(path.join(__dirname, '')));
app.use('/', express.static(path.join(__dirname, '')));
// app.use(expressValidator());
_router(app);

module.exports = app;
