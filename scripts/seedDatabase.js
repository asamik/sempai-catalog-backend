'use strict';

var exec = require('child_process').execSync;

console.log('seeding database from data/usershashed.json');
exec(`mongoimport --db connectproject --collection users --drop --file ./data/usershashed.json --jsonArray`);

console.log('seeding database from data/speakerdetail.json');
exec(`mongoimport --db connectproject --collection speakerdetails --drop --file ./data/speakerdetail.json --jsonArray`);
