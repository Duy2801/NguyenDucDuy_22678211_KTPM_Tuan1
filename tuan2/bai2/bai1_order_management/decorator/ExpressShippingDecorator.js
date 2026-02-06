const OrderDecorator = require("./OrderDecorator");

class ExpressShippingDecorator extends OrderDecorator {
  constructor(order, expressFee = 100000) {
    super(order);
    this.expressFee = expressFee;
  }

  getTotalAmount() {
    return this.order.getTotalAmount() + this.expressFee;
  }

  process() {
    super.process();
    console.log(`  🚀 Đã thêm vận chuyển nhanh: +${this.expressFee} VND`);
  }
}

module.exports = ExpressShippingDecorator;
