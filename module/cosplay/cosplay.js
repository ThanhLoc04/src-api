exports.name = '/cosplay';
exports.index = async(req, res, next) => {
  var data = require('fs-extra').readFileSync(__dirname + '/cosplay.txt', 'utf-8').split(/\r?\n/);
  link = data[Math.floor(Math.random() * data.length)].trim();
  link1 = data[Math.floor(Math.random() * data.length)].trim();
  res.json({"Authors":"Đức tài cuti vcl",
"url":`${link}`,
"data":`${link1}`});
};