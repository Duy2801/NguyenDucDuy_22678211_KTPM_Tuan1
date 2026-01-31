const OrderState = require("./OrderState");

class NewOrderState extends OrderState {
  handle() {
    console.log("📦 Đơn hàng mới được tạo");
  }
}

module.exports = NewOrderState;
