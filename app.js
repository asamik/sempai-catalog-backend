'use strict';

const express = require('express')
    , path = require('path')
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , mongoose = require('mongoose')
    , cors = require('cors');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/connectproject');
    
let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({limit: '2mb'}, { extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public/build')));


let whitelist = ['http://asamik.github.io/sempai-catalog-frontend', 'http://localhost:4000', 'http://localhost:3001',  'http://asamik.github.io/connectproject'];
let corsOptions = {
  origin: function(origin, callback) {
    let originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};
app.use(cors(corsOptions));


app.use('/users', require('./routes/users'));
app.use('/admins', require('./routes/admins'));

app.all('/*', function(req, res, next) {
    res.sendFile('index.html', { root: path.join(__dirname, 'public/build') });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
