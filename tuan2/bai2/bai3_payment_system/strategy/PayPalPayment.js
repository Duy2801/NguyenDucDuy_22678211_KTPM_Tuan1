const PaymentMethod = require("./PaymentMethod");

class PayPalPayment extends PaymentMethod {
  execute(amount) {
    console.log(`  💰 Thanh toán ${amount} VND qua PayPal`);
    console.log(`  ✓ Đăng nhập PayPal...`);
    console.log(`  ✓ Thanh toán thành công!`);
  }

  getMethodName() {
    return "PayPal";
  }
}

module.exports = PayPalPayment;
