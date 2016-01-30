'use strict';

const mongoose = require('mongoose')
    , jwt      = require('jwt-simple')
    , bcrypt   = require('bcryptjs')
    , moment   = require('moment')
    , CONFIG   = require('../util/authConfig');

var Schema = mongoose.Schema;

let User;

let userSchema = mongoose.Schema({
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  name: {type: String},
  phone: {type: String},
  organization: {type: String},
  position: {type: String},
  region: {type: String},
  profilePic: {type: String},
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
  console.log('userInfo', userInfo)
  User.findOne({email: userInfo.email}, (err, foundUser) => {
  console.log('foundUser', foundUser)
    if (err) return cb('server error');
    if (!foundUser) return cb('incorrect email or password');
    bcrypt.compare(userInfo.password, foundUser.password, (err, isGood) => {
      if (err) return cb('server err');
      if (isGood) {
        foundUser.password = null;
  console.log('foundUser2:', foundUser)

        return cb(null, foundUser.token());
      } else {
        return cb('incorrect email or password');
      }
    });
  });
}

userSchema.statics.register = function(userInfo, cb) {
  let email     = userInfo.email
    , password  = userInfo.password
    , password2 = userInfo.password2;
    console.log('userInfo', userInfo)

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
        if (err) return cb(err);
        let newUser = new User({
          email: email,
          password: hashedPassword,
          name: userInfo.name,
          phone: userInfo.phone,
          organization: userInfo.organization,
          position: userInfo.position,
          profilePic: userInfo.profilePic
        });
        newUser.save((err, savedUser) => {
          savedUser.password = null;
          return cb(err, savedUser.token());
        })
      });
    });
  });
};

User = mongoose.model('User', userSchema);
module.exports = User;
