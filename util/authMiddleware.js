'use strict';

const jwt     = require('jwt-simple')
    , moment  = require('moment')
    , CONFIG  = require('./authConfig');

module.exports = function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send('authorization required');
  }
  let decoded;
  try {
    decoded = jwt.decode(req.headers.authorization.replace(/(Bearer )(.*)/, '$2'), process.env.JWT_SECRET);
    console.log('decoded in try', decoded)
    console.log('decoded in try reqparams:', req.params)
  } catch (e) {
    logMyErrors(e);
    console.log('catch')
    return res.status(401).send('authorization required');
  }

  if (decoded.exp < moment().unix()) {
    console.log('moment')
    return res.status(401).send('authorization expired');
  }
  req.decodedToken = decoded;
  next();
};
