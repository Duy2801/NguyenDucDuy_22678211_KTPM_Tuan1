const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/orders', (req, res) => {
    const db = JSON.parse(fs.readFileSync('./db.json'));
    const newOrder = {
        id: db.orders.length + 1,
        product: req.body.product,
        paymentStatus: 'Chờ thanh toán',
        shippingStatus: 'Chờ giao hàng'
    };
    db.orders.push(newOrder);
    fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
    console.log("Order Service: Đã tạo đơn hàng mới");
    res.json(newOrder);
});

app.listen(8081, () => console.log("Order Service chạy tại port 8081"));