const PaymentMethod = require("./PaymentMethod");

class CreditCardPayment extends PaymentMethod {
  execute(amount) {
    console.log(`  💳 Thanh toán ${amount} VND qua Thẻ tín dụng`);
    console.log(`  ✓ Xác thực thẻ...`);
    console.log(`  ✓ Thanh toán thành công!`);
  }

  getMethodName() {
    return "Thẻ tín dụng";
  }
}

module.exports = CreditCardPayment;
