const TransactionDecorator = require("./TransactionDecorator");

class LoyaltyPointsDecorator extends TransactionDecorator {
  constructor(transaction, points = 100) {
    super(transaction);
    this.points = points;
  }

  getAmount() {
    return this.transaction.getAmount();
  }

  process() {
    super.process();
    console.log(`  ⭐ Tích điểm thưởng: +${this.points} điểm`);
  }
}

module.exports = LoyaltyPointsDecorator;
