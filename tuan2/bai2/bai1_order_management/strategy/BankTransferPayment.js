const PaymentStrategy = require("./PaymentStrategy");

class BankTransferPayment extends PaymentStrategy {
  pay(amount) {
    console.log(`  🏦 Thanh toán ${amount} VND bằng Chuyển khoản ngân hàng`);
  }
}

module.exports = BankTransferPayment;
