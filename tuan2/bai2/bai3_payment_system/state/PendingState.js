const TransactionState = require("./TransactionState");

class PendingState extends TransactionState {
  handle(transaction) {
    console.log("  ⏳ Giao dịch đang chờ xử lý...");
    console.log(`  ✓ Mã giao dịch: ${transaction.transactionId}`);
    console.log(`  ✓ Số tiền: ${transaction.getAmount()} VND`);
  }

  getStateName() {
    return "Chờ xử lý";
  }

  canProcess() {
    return true;
  }
}

module.exports = PendingState;
