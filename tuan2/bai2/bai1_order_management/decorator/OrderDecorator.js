// Base Decorator cho đơn hàng
class OrderDecorator {
  constructor(order) {
    this.order = order;
  }

  getTotalAmount() {
    return this.order.getTotalAmount();
  }

  setState(state) {
    this.order.setState(state);
  }

  setPaymentStrategy(strategy) {
    this.order.setPaymentStrategy(strategy);
  }

  process() {
    this.order.process();
  }

  checkout() {
    this.order.checkout();
  }

  get orderId() {
    return this.order.orderId;
  }
}

module.exports = OrderDecorator;
