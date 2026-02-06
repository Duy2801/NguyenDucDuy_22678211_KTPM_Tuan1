const TransactionDecorator = require("./TransactionDecorator");

class DiscountCodeDecorator extends TransactionDecorator {
  constructor(transaction, discountRate = 0.1) {
    super(transaction);
    this.discountRate = discountRate; // 10% giảm giá
  }

  getAmount() {
    const baseAmount = this.transaction.getAmount();
    const discount = baseAmount * this.discountRate;
    const total = baseAmount - discount;
    return total;
  }

  process() {
    super.process();
    const discount = this.transaction.getAmount() * this.discountRate;
    console.log(`  🎫 Mã giảm giá (${this.discountRate * 100}%): -${discount} VND`);
  }
}

module.exports = DiscountCodeDecorator;
