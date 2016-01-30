'use strict';

const jwt     = require('jwt-simple')
    , moment  = require('moment')
    , CONFIG  = require('./authConfig')
    , Teacher = require('../models/userModel');

module.exports = function(req, res, next) {
  console.log('auth req:', req.body)
  if (!req.body.token) {
    return res.status(401).send('authorization required');
  }

  try {
    let decoded = jwt.decode(req.body.token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).send('authorization required');
  }

  if (decoded.exp < moment().unix()) {
    return res.status(401).send('authorization expired');
  }

  req.decodedToken = decoded;
  next();
};
