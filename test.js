const fs = require('fs');
let dir = '/home/wh/Projects/DriftingLibrary/temp/';
fs.readdir(dir, function (err, files) {
  files = files
    .map(function (fileName) {
      return {
        name: fileName,
        time: fs.statSync(dir + '/' + fileName).mtime.getTime(),
      };
    })
    .sort(function (a, b) {
      return a.time - b.time;
    })
    .map(function (v) {
      return v.name;
    });
  console.log(files);
});
