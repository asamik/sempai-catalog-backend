'use strict';

var data = require('../data/users.json');
var fs = require('fs');
var bcrypt = require('bcryptjs')
var CONFIG = require('../util/authConfig');

console.log('hashing passwords & adding profile pics');

data = data.map(function(doc){
  var salt = bcrypt.genSaltSync(CONFIG.saltRounds);
  var hash = bcrypt.hashSync(doc.password, salt);
  doc.password = hash;
  var randomInt = Math.ceil(Math.random() * 10);
  doc.profilePic = `http://lorempixel.com/200/200/cats/${randomInt}`;
  console.log(doc);
  return doc;
});

console.log('writing to data/usershashed.json');

fs.writeFileSync('./data/usershashed.json', JSON.stringify(data));
