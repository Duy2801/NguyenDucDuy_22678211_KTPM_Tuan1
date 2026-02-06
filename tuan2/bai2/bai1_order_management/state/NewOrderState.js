const OrderState = require("./OrderState");

class NewOrderState extends OrderState {
  handle(order) {
    console.log("  📝 Kiểm tra thông tin đơn hàng...");
    console.log(`  ✓ Đơn hàng #${order.orderId} đã được tạo thành công`);
    console.log(`  ✓ Tổng giá trị: ${order.getTotalAmount()} VND`);
  }

  getStateName() {
    return "Mới tạo";
  }
}

module.exports = NewOrderState;
