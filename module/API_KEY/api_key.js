const fs = require('fs');
const path = require('path');
exports.name = '/apikey';
exports.index = async (req, res, next) => {
  const path_D = path.join(__dirname, 'data', 'data_apikey.json');
  if (!fs.existsSync(path_D)) {
    fs.writeFileSync(path_D, '[]', 'utf-8');
  }
  const data_apikey = require('./data/data_apikey.json');
  if (data_apikey.find(i => i.name == req.query.name)) {
    return res.json({
      status: 0,
      error: 'Bạn đã có key trên hệ thống'
    });
  }
  if (req.query.type == 'register') {
    let name = req.query.name;
    if (!name) return res.json({
      error: 'Thiếu dữ liệu để thực hiện yêu cầu cho bạn.'
    });
    else {
      if (req.query.apitype == 'vip') {
        if (req.query.apikey != 'Admin_6517754372') return res.json({
          error: 'Apikey admin không chính xác'
        });
        var apikey = 'Vip_';
        var request = 'infinite';
        var type = "vip";
      } else {
        var apikey = 'Free_';
        var type = "free";
        var request = 450;
      }
      const data = require('./data/data_apikey.json');
      var random = '1234567890';
      var number = 10;
      for (var i = 0; i < number; i++) {
        apikey += random.charAt(Math.floor(Math.random() * random.length));
      }
      data.push({ apikey, request, name, type });
      fs.writeFileSync(path_D, JSON.stringify(data, null, 2), 'utf-8');
      res.json({
        status: 1,
        apikey,
        type,
        message: 'Tạo apikey thành công!'
      })
    }
  } else if (req.query.type == 'checker') {
    var apikey = req.query.apikey;
    const data = require('./data/data_apikey.json');
    if (!data.find(i => i.apikey == apikey)) {
      return res.json({
        error: 'APIKEY không tồn tại!'
      })
    } else {
      var APIKEY = data.find(i => i.apikey == apikey);
      return res.json(APIKEY)
    }
  } else {
    return res.json({
      error: 'Không tìm thấy lệnh mà bạn yêu cầu'
    })
  }
}