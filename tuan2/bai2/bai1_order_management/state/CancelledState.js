const OrderState = require("./OrderState");

class CancelledState extends OrderState {
  handle(order) {
    console.log("  ❌ Hủy đơn hàng...");
    console.log(`  ✓ Đơn hàng #${order.orderId} đã được hủy`);
    console.log(`  ✓ Hoàn tiền: ${order.getTotalAmount()} VND`);
    console.log(`  ✓ Gửi thông báo hủy đơn đến khách hàng`);
  }

  getStateName() {
    return "Đã hủy";
  }
}

module.exports = CancelledState;
