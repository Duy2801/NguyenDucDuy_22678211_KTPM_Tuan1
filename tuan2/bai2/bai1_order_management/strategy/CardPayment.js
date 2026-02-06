const PaymentStrategy = require("./PaymentStrategy");

class CardPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`  💳 Thanh toán ${amount} VND bằng Thẻ tín dụng`);
  }
}

module.exports = CardPayment;
