const OrderState = require("./OrderState");

class ShippingState extends OrderState {
  handle() {
    console.log("🚚 Đơn hàng đang được giao");
  }
}

module.exports = ShippingState;
