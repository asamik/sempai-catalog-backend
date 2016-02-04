'use strict';

const mongoose = require('mongoose')
    , moment   = require('moment')
    , CONFIG   = require('../util/authConfig')

let Schema = mongoose.Schema;

let SpeakerDetail;

let speakerDetailSchema = mongoose.Schema({
  expertise: {type: String},
  fee: {type: String},
  topics: {type: String},
  header: {type: String},
  selfintroduction: {type: String},
  background: {type: String},
  referencecomment: {type: String},
  userId: {type: Schema.Types.ObjectId, ref: 'User'}
});

SpeakerDetail = mongoose.model('SpeakerDetail', speakerDetailSchema);
module.exports = SpeakerDetail;
