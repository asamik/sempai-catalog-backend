'use strict';

const mongoose = require('mongoose')
    , moment   = require('moment')
    , CONFIG   = require('../util/authConfig')
    , User     = require('../models/userModel');

var Schema = mongoose.Schema;

let SpeakerDetail;

let speakerDetailSchema = mongoose.Schema({
  expertise: {type: String, required: true},
  fee: {type: String, required: true},
  topics: {type: String},
  header: {type: String, required: true},
  selfintroduction: {type: String},
  background: {type: String},
  referencecomment: {type: String},
  userId: {type: Schema.Types.ObjectId, ref: 'User'}
});

speakerDetailSchema.statics.register = function(speakerDetail, cb) {
  let email = speakerDetail.email

  // create speakerdetailmodel and attach userid from email
  User.findOne({email: email}, (err, user) => {
    if (err) return cb('error finding email');

    User.findByIdAndUpdate(user._id, {$set: {speaker: true}}, (err, user) => {
      if (err) return cb('error updating speaker to true');

      console.log("after user", user)
      let newSpeakerDetail = new SpeakerDetail({
        expertise: speakerDetail.expertise,
        fee: speakerDetail.fee,
        topics: speakerDetail.topics,
        header: speakerDetail.header,
        selfintroduction: speakerDetail.selfintroduction,
        background: speakerDetail.background,
        userId: user._id
      });
      newSpeakerDetail.save((err, savedSpeakerDetail) => {
        return cb(err, savedSpeakerDetail);
      })
    });
  });
};

SpeakerDetail = mongoose.model('SpeakerDetail', speakerDetailSchema);
module.exports = SpeakerDetail;
