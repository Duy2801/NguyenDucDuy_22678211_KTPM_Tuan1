// Base State cho đơn hàng
class OrderState {
  handle(order) {
    throw new Error("Method handle() must be implemented");
  }

  getStateName() {
    throw new Error("Method getStateName() must be implemented");
  }
}

module.exports = OrderState;
