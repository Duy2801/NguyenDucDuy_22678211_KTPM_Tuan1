const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());

app.put('/payments/:id', (req, res) => {
    const db = JSON.parse(fs.readFileSync('./db.json'));
    const order = db.orders.find(o => o.id == req.params.id);
    if (order) {
        order.paymentStatus = 'ĐÃ THANH TOÁN';
        fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
        console.log("Payment Service: Đã cập nhật thanh toán cho đơn " + req.params.id);
        res.json(order);
    } else {
        res.status(404).send("Không tìm thấy đơn");
    }
});

app.listen(8082, () => console.log("Payment Service chạy tại port 8082"));