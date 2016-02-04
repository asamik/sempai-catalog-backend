'use strict';

const jwt    = require('jwt-simple')
    , moment = require('moment')
    , CONFIG = require('./authConfig');

module.exports = function(req, res, next) {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).send('authorization required');
  }

  try {
    let decoded = jwt.decode(token, process.env.JWT_SECRET);
  } catch (e) {
    return res.status(401).send('authorization required');
  }

  if (decoded.exp < moment().unix()) {
    return res.status(401).send('authorization expired');
  }

  if (!decoded.admin) {
    return res.status(401).send('authorization required');
  }

  next();
};
