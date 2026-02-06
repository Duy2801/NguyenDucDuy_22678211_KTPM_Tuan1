const TransactionState = require("./TransactionState");

class ProcessingState extends TransactionState {
  handle(transaction) {
    console.log("  🔄 Đang xử lý giao dịch...");
    console.log(`  ✓ Xác thực thông tin thanh toán`);
    console.log(`  ✓ Kiểm tra số dư tài khoản`);
  }

  getStateName() {
    return "Đang xử lý";
  }

  canProcess() {
    return true;
  }
}

module.exports = ProcessingState;
