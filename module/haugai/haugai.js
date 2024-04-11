exports.name = '/haugai';
exports.index = async(req, res, next) => {
  var data = require('fs-extra').readFileSync(__dirname + '/haugai.txt', 'utf-8').split(/\r?\n/);;
  link = data[Math.floor(Math.random() * data.length)].trim();
  link1 = data[Math.floor(Math.random() * data.length)].trim();
  res.jsonp({"Authors":"Đức tài cuti vcl",
             "url":`${link}`,
             "data":`${link1}`});
};