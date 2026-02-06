// Base Strategy cho phương thức thanh toán
class PaymentMethod {
  execute(amount) {
    throw new Error("Method execute() must be implemented");
  }

  getMethodName() {
    throw new Error("Method getMethodName() must be implemented");
  }
}

module.exports = PaymentMethod;
