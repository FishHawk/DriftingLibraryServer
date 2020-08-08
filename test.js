const moment = require('moment');
const str = '2020-08-09 00:06:10';
const d = new Date(str);
var date = moment(str).valueOf();
console.log(date);
