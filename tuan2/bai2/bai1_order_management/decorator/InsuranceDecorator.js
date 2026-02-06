const OrderDecorator = require("./OrderDecorator");

class InsuranceDecorator extends OrderDecorator {
  constructor(order, insuranceFee = 50000) {
    super(order);
    this.insuranceFee = insuranceFee;
  }

  getTotalAmount() {
    return this.order.getTotalAmount() + this.insuranceFee;
  }

  process() {
    super.process();
    console.log(`  🛡️ Đã thêm bảo hiểm: +${this.insuranceFee} VND`);
  }
}

module.exports = InsuranceDecorator;
