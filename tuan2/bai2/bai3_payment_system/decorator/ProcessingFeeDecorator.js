const TransactionDecorator = require("./TransactionDecorator");

class ProcessingFeeDecorator extends TransactionDecorator {
  constructor(transaction, feeRate = 0.02) {
    super(transaction);
    this.feeRate = feeRate; // 2% phí xử lý
  }

  getAmount() {
    const baseAmount = this.transaction.getAmount();
    const fee = baseAmount * this.feeRate;
    const total = baseAmount + fee;
    return total;
  }

  process() {
    super.process();
    const fee = this.transaction.getAmount() * this.feeRate;
    console.log(`  💸 Phí xử lý (${this.feeRate * 100}%): +${fee} VND`);
  }
}

module.exports = ProcessingFeeDecorator;
