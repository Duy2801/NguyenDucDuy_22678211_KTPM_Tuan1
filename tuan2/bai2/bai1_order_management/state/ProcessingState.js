const OrderState = require("./OrderState");

class ProcessingState extends OrderState {
  handle(order) {
    console.log("  📦 Đang xử lý đơn hàng...");
    console.log(`  ✓ Đóng gói sản phẩm`);
    console.log(`  ✓ Chuẩn bị vận chuyển đơn hàng #${order.orderId}`);
  }

  getStateName() {
    return "Đang xử lý";
  }
}

module.exports = ProcessingState;
