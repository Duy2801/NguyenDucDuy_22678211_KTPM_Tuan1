const PaymentStrategy = require("./PaymentStrategy");

class CashPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`💵 Thanh toán ${amount} bằng tiền mặt`);
  }
}

module.exports = CashPayment;
