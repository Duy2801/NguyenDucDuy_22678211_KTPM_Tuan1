const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());

app.put('/shippings/:id', (req, res) => {
    const db = JSON.parse(fs.readFileSync('./db.json'));
    const order = db.orders.find(o => o.id == req.params.id);
    if (order) {
        order.shippingStatus = 'ĐÃ GIAO HÀNG';
        fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
        console.log("Shipping Service: Đã giao đơn " + req.params.id);
        res.json(order);
    } else {
        res.status(404).send("Không tìm thấy đơn");
    }
});

app.listen(8083, () => console.log("Shipping Service chạy tại port 8083"));