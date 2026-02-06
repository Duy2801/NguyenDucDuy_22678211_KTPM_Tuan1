const OrderState = require("./OrderState");

class DeliveredState extends OrderState {
  handle(order) {
    console.log("  ✅ Đơn hàng đã giao thành công!");
    console.log(`  ✓ Cập nhật trạng thái đơn hàng #${order.orderId} là 'Đã giao'`);
    console.log(`  ✓ Gửi email xác nhận đến khách hàng`);
  }

  getStateName() {
    return "Đã giao";
  }
}

module.exports = DeliveredState;
