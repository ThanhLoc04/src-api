const axios = require('axios');

exports.name = '/res';
exports.index = async (req, res) => {

    var uid = req.query.uid;
    if (!uid) return res.json({
        error: "Hãy thêm ?uid= <uid> rồi thử lại!"
    })

    try {
        const resp = await axios.get(`=${uid}`);
        var data = resp.data;
        return res.send({
            body: `
╭─────────────⭓
│ Tên: ${data.name}
│ Uid: ${uid}
│ Username: ${data.username}
│ Link fb: ${data.link}
│ Ngày tạo acc: ${data.ngay_tao_acc}
│ Follower: ${data.follower}
╰─────────────⭓`, avt: data.avtlink, anh_bia: data.cover.source
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Đã có lỗi xảy ra khi lấy thông tin từ Facebook" });
    }
}
