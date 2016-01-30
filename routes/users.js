'use strict';

const express        = require('express')
    , User           = require('../models/userModel')
    , SpeakerDetail  = require('../models/speakerdetailModel')
    , authenticate   = require('../util/authMiddleware');

let router = express.Router();

router.get('/', authenticate, (req, res) => {
  User.find({'speaker': true}, (err, users) => {
    if (err) return res.status(400).send(err);
    users.forEach(user => {
      user.password = null;
      return user;
    });
    res.send(users);
  })
});

router.get('/speaker/:speakerid', authenticate,(req, res) => {
  let speakerFullInfo = {};
  User.findById(req.params.speakerid, (err, speaker) => {
    if (err || !speaker) return res.status(400).send(err || 'speaker not found');

    SpeakerDetail.findOne({userId: speaker._id}, (err, speakerdetail) => {
      if (err || !speakerdetail) return res.status(400).send(err || 'speakerdetail not found');
      console.log("speakerdetail before", speakerdetail)

//WET- refactor later!
      speakerFullInfo.email = speaker.email
      speakerFullInfo.name = speaker.name
      speakerFullInfo.phone = speaker.phone
      speakerFullInfo.organization = speaker.organization
      speakerFullInfo.position = speaker.position
      speakerFullInfo.region = speaker.region
      speakerFullInfo.profilepic = speaker.profilepic
      speakerFullInfo.admin = speaker.admin
      speakerFullInfo.speaker = speaker.speaker

      speakerFullInfo.expertise = speakerdetail.expertise
      speakerFullInfo.fee = speakerdetail.fee
      speakerFullInfo.topics = speakerdetail.topics
      speakerFullInfo.header = speakerdetail.header
      speakerFullInfo.selfintroduction = speakerdetail.selfintroduction
      speakerFullInfo.background = speakerdetail.background
      speakerFullInfo.referencecomment = speakerdetail.referencecomment
   console.log("speaker full info", speakerFullInfo)
      res.send(speakerFullInfo);
    });
  });
});

router.post('/checkemail', (req, res) => {
  User.findOne({email: req.body.email}, (err, user) => {
    if (err || user) return res.status(400).send(err || 'email is already in use');
    res.send(req.body.email);
  });
});

router.post('/register', (req, res) => {
  User.register(req.body, (err, token) => {
    if (err) return res.status(400).send(err);
    res.cookie('token', token).send();
  });
});

router.post('/login', (req, res) => {
  User.login(req.body, (err, token) => {
    if (err) return res.status(400).send(err);
    console.log('token', token)
    res.cookie('token', token).send();
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
  })
})

router.put('/removefriend/:userId/:friendId', authenticate, (req, res) => {
  User.findByIdAndUpdate(req.params.userId, { $pull: {friends: req.params.friendId} }, function(err, user){
    res.status(err ? 400 : 200).send(err || 'friend removed');
  })
})

router.put('/edit/:id', authenticate, (req, res) => {
  User.findByIdAndUpdate(req.params.id, { $set: req.body }, function(err, user){
    res.status(err ? 400 : 200).send(err || user);
  })
})

router.post('/speakerdetail/register', (req, res) => {
  console.log("req.body!!", req.body)
  SpeakerDetail.register(req.body, (err, token) => {
    res.status(err ? 400 : 200).send(err || 'Speaker detail registered');
  });
});


module.exports = router;
