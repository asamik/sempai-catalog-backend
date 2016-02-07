'use strict';

const express        = require('express')
    , User           = require('../models/userModel')
    , SpeakerDetail  = require('../models/speakerdetailModel')
    , authenticate   = require('../util/authMiddleware')
    , async          = require('async');

let router = express.Router();

router.get('/', authenticate, (req, res) => {
  User.find({'speaker': true}, (err, users) => {
    let userIdList = users.map(user => {
      return user._id;
    });
    if (err) return res.status(400).send(err);

    async.map(userIdList, User.findspeakerFullData, (err, speakers) => {
      if(err) return res.status(400).send(err);
      console.log("speakers", speakers)
        res.send(speakers);	
    });
  })
});

router.get('/speaker/:speakerid', authenticate,(req, res) => {
  User.findspeakerFullData(req.params.speakerid, (err, speakerFulldata) => {
    if(err) return res.status(400).send(err);
    res.send(speakerFulldata);    
  })
});

router.post('/checkemail', (req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    if (err || user) return res.status(400).send(err || 'email is already in use');
    res.send(req.body.email);
  });
});

router.post('/register', (req, res) => {
  User.register(req.body, (err, userInfoWithToken) => {
    if (err) return res.status(400).send(err);
    res.json(userInfoWithToken);
  });
});

router.post('/login', (req, res) => {
  User.login(req.body, (err, userInfoWithToken) => {
    if (err) return res.status(400).send(err);
    res.json(userInfoWithToken);
  });
});

router.get('/:id', authenticate, (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err || !user) return res.status(400).send(err || 'user not found');
    user.password = null;
    res.send(user);
  });
});

router.put('/addfriend/:userId/:friendId', authenticate, (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { $push: {friends: req.params.friendId} }, function(err, user){
    res.status(err ? 400 : 200).send(err || 'friend added');
  });
});

router.put('/removefriend/:userId/:friendId', authenticate, (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { $pull: {friends: req.params.friendId} }, (err, user) => {
    res.status(err ? 400 : 200).send(err || 'friend removed');
  });
});

router.put('/edit/:id', authenticate, (req, res) => {
  User.edit(req.body, req.params.id, (err, updatedUser) => {
    console.log("updatedUser!!", updatedUser)
    res.status(err ? 400 : 200).send(err || updatedUser);
  });
});

router.put('/editspeakerdetail/:id', authenticate, (req, res) => {
  SpeakerDetail.findOneAndUpdate({userId: req.params.id}, { $set: req.body }, (err, user) => {
    if(err) return res.status(400).send(err);
    res.send(user);
  });
});

router.post('/speakerdetail/register/:userid', authenticate, (req, res) => {
  User.registerAsSpeaker(req.params.userid, req.body, (err, savedSpeakerDetail) => {
    res.status(err ? 400 : 200).send(err || savedSpeakerDetail);
  });
});

module.exports = router;
