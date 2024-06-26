const axios = require('axios');

exports.name = '/tai';
exports.index = async(req, res, next) => {
  try {
    var data = require('fs-extra').readFileSync(__dirname + '/tai.txt', 'utf-8').split(/\r?\n/);
    link = data[Math.floor(Math.random() * data.length)].trim();
    link1 = data[Math.floor(Math.random() * data.length)].trim();
    link2 = data[Math.floor(Math.random() * data.length)].trim();

    const response = await axios.get(link, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];

    if (contentType.includes('image')) {
      res.set('Content-Type', contentType);
      res.send(response.data);
    } else if (contentType.includes('video')) {
      res.set('Content-Type', contentType);
      res.send(response.data);
    } else if (contentType.includes('audio')) {
      res.set('Content-Type', contentType);
      res.send(response.data);
    } else {
      throw new Error('Loại nội dung không được hỗ trợ');
    }
  } catch (error) {
    console.error(error);
    res.send(error.message);
  }
};