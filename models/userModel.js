'use strict';

const mongoose = require('mongoose')
    , jwt      = require('jwt-simple')
    , bcrypt   = require('bcryptjs')
    , moment   = require('moment')
    , SpeakerDetail  = require('./speakerdetailModel')
    , CONFIG   = require('../util/authConfig');

var Schema = mongoose.Schema;

let User;

let userSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true, select: false},
  name: {type: String},
  organization: {type: String},
  position: {type: String},
  region: {type: String},
  admin: {type: Boolean, default: false, required: true},
  speaker: {type: Boolean, default: false, required: true}
});

userSchema.methods.token = function() {
  let payload = {
    id: this._id,
    iat: moment().unix(),
    exp: moment().add(CONFIG.expTime.num, CONFIG.expTime.unit).unix(),
    admin: this.admin
  };
  return jwt.encode(payload, process.env.JWT_SECRET);
};

userSchema.statics.login = function(userInfo, cb) {
  // look for user in database
  User.findOne({email: userInfo.email}).select("password").exec((err, foundUser) => {
    if (err) return cb('server error');
    if (!foundUser) return cb('incorrect email or password');
    bcrypt.compare(userInfo.password, foundUser.password, (err, isGood) => {
      if (err) return cb('server err');
      if (isGood) {
        let userInfoWithToken = { id: foundUser._id, token: foundUser.token() };
        return cb(null, userInfoWithToken);
      } else {
        return cb('incorrect email or password');
      }
    });
  });
}

userSchema.statics.findspeakerFullData = function(speakerid, cb) {
  User.findById(speakerid, (err, speaker) => {
    if (err || !speaker) return cb(err || 'speaker not found');

    SpeakerDetail.findOne({userId: speaker._id}, (err, speakerdetail) => {
      if (err || !speakerdetail) return cb(err || 'speakerdetail not found');

      speaker = speaker.toObject();
      speaker.expertise = speakerdetail.expertise;
      speaker.fee = speakerdetail.fee;
      speaker.topics = speakerdetail.topics;
      speaker.header = speakerdetail.header;
      speaker.selfintroduction = speakerdetail.selfintroduction;
      speaker.background = speakerdetail.background;
      // speaker.referencecomment = speakerdetail.referencecomment;
      cb(null, speaker);
    });  
  });
}

userSchema.statics.registerAsSpeaker = function(userid, speakerDetail, cb) {
  User.findByIdAndUpdate(userid, {$set: {speaker: true}}, {new: true}, (err, user) => {
    if (err || !user) return cb(err || 'user not found');

    let newSpeakerDetail = new SpeakerDetail({
      expertise: speakerDetail.expertise,
      fee: speakerDetail.fee,
      topics: speakerDetail.topics,
      header: speakerDetail.header,
      selfintroduction: speakerDetail.selfintroduction,
      background: speakerDetail.background,
      userId: userid
    });
    newSpeakerDetail.save((err, savedSpeakerDetail) => {
      cb(null, savedSpeakerDetail);
    })
  });
};

userSchema.statics.register = function(userInfo, cb) {
  let email     = userInfo.email
    , password  = userInfo.password
    , password2 = userInfo.password2;

  // compare passwords
  if (password !== password2) {
    return cb("passwords don't match");
  }

  // validate password
  if (!CONFIG.validatePassword(password)) {
    return cb('invalid password');
  }

  // create user model
  User.findOne({email: email}, (err, user) => {
    if (err || user) return cb('error registering email');
    bcrypt.genSalt(CONFIG.saltRounds, (err, salt) => {
      if (err) return cb(err);
      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err) return cb(err)
        let newUser = new User({
          email: email,
          password: hashedPassword,
          name: userInfo.name,
          organization: userInfo.organization,
          position: userInfo.position,
          region: userInfo.region
        });
        newUser.save((err, savedUser) => {
          savedUser.password = null;
          let userInfoWithToken = { id: savedUser._id, token: savedUser.token() };
          return cb(err, userInfoWithToken);
        })
      });
    });
  });
};

userSchema.statics.edit = function(user, userid,cb) {
  let updatedUser = {
    name: user.name,
    position: user.position,
    region: user.region,
    organization: user.organization
  }
  User.findByIdAndUpdate(userid, { $set: updatedUser }, {new: true}, (err, userAfterUpdate) => {
        if (err || !user) return cb(err || 'user not found in update');
    cb(null, userAfterUpdate);
  })
}

User = mongoose.model('User', userSchema);
module.exports = User;
