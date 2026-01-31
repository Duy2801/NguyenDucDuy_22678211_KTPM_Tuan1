const OrderState = require("./OrderState");

class CompletedState extends OrderState {
  handle() {
    console.log("✅ Đơn hàng đã hoàn thành");
  }
}

module.exports = CompletedState;
