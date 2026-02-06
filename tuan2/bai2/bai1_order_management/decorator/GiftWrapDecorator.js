const OrderDecorator = require("./OrderDecorator");

class GiftWrapDecorator extends OrderDecorator {
  constructor(order, giftWrapFee = 20000) {
    super(order);
    this.giftWrapFee = giftWrapFee;
  }

  getTotalAmount() {
    return this.order.getTotalAmount() + this.giftWrapFee;
  }

  process() {
    super.process();
    console.log(`  🎁 Đã thêm gói quà: +${this.giftWrapFee} VND`);
  }
}

module.exports = GiftWrapDecorator;
