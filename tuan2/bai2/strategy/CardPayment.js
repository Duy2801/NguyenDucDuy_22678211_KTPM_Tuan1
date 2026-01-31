const PaymentStrategy = require("./PaymentStrategy");

class CardPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`💳 Thanh toán ${amount} bằng thẻ`);
  }
}

module.exports = CardPayment;
    