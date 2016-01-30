'use strict';

const express = require('express')
    , User    = require('../models/userModel')
    , authenticateAdmin = require('../util/authAdminMiddleware');

let router = express.Router();

router.delete('/remove/:id', authenticateAdmin, (req, res) => {
  User.findByIdAndRemove(req.params.id, (err, user) => {
    res.status(err? 400 : 200).send(err ? 'user delete failed': 'user deleted!')
  });
});

router.put('/makeadmin/:userId/', authenticateAdmin, (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { $set: {admin: true} }, function(err, user){
    res.status(err ? 400 : 200).send(err || 'made into admin');
  });
})

router.put('/edit/:id', authenticateAdmin, (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: req.body }, function(err, user){
    res.status(err ? 400 : 200).send(err || user);
  });
})

module.exports = router;
