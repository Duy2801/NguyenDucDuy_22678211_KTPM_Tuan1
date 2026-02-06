const PaymentStrategy = require("./PaymentStrategy");

class CashPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`  💵 Thanh toán ${amount} VND bằng Tiền mặt`);
  }
}

module.exports = CashPayment;
