class PaymentStrategy {
  pay(amount) {
    throw new Error("pay() must be implemented");
  }
}

module.exports = PaymentStrategy;
