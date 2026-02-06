const PaymentMethod = require("./PaymentMethod");

class BankTransferPayment extends PaymentMethod {
  execute(amount) {
    console.log(`  🏦 Thanh toán ${amount} VND qua Chuyển khoản ngân hàng`);
    console.log(`  ✓ Kết nối ngân hàng...`);
    console.log(`  ✓ Thanh toán thành công!`);
  }

  getMethodName() {
    return "Chuyển khoản ngân hàng";
  }
}

module.exports = BankTransferPayment;
