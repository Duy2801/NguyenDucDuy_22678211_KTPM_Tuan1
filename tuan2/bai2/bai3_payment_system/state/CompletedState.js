const TransactionState = require("./TransactionState");

class CompletedState extends TransactionState {
  handle(transaction) {
    console.log("  ✅ Giao dịch hoàn tất!");
    console.log(`  ✓ Đã thanh toán thành công ${transaction.getAmount()} VND`);
    console.log(`  ✓ Gửi email xác nhận thanh toán`);
  }

  getStateName() {
    return "Hoàn tất";
  }

  canProcess() {
    return false; // Đã hoàn tất không thể xử lý thêm
  }
}

module.exports = CompletedState;
