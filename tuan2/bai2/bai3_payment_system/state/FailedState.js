const TransactionState = require("./TransactionState");

class FailedState extends TransactionState {
  handle(transaction) {
    console.log("  ❌ Giao dịch thất bại!");
    console.log(`  ✓ Lý do: Không đủ số dư hoặc thông tin không hợp lệ`);
    console.log(`  ✓ Hoàn tiền về tài khoản`);
  }

  getStateName() {
    return "Thất bại";
  }

  canProcess() {
    return false; // Giao dịch thất bại không thể xử lý
  }
}

module.exports = FailedState;
