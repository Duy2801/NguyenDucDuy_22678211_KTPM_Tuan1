// Context cho State Pattern
class Order {
  constructor(orderId, baseAmount = 0) {
    this.orderId = orderId;
    this.baseAmount = baseAmount;
    this.state = null;
    this.paymentStrategy = null;
  }

  setState(state) {
    this.state = state;
  }

  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
  }

  process() {
    if (!this.state) {
      console.log("  ⚠️ Chưa thiết lập trạng thái cho đơn hàng!");
      return;
    }
    console.log(`\n[STATE: ${this.state.getStateName()}]`);
    this.state.handle(this);
  }

  getTotalAmount() {
    return this.baseAmount;
  }

  checkout() {
    if (!this.paymentStrategy) {
      console.log("  ⚠️ Chưa chọn phương thức thanh toán!");
      return;
    }
    this.paymentStrategy.pay(this.getTotalAmount());
  }
}

module.exports = Order;
