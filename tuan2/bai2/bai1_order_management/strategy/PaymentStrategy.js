// Base Strategy cho thanh toán
class PaymentStrategy {
  pay(amount) {
    throw new Error("Method pay() must be implemented");
  }
}

module.exports = PaymentStrategy;
