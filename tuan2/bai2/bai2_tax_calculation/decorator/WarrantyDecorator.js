const ProductDecorator = require("./ProductDecorator");

class WarrantyDecorator extends ProductDecorator {
  constructor(product, warrantyFee = 50000) {
    super(product);
    this.warrantyFee = warrantyFee;
  }

  getTotalPrice() {
    const total = this.product.getTotalPrice() + this.warrantyFee;
    console.log(`  🛡️ Phí bảo hành: +${this.warrantyFee} VND`);
    return total;
  }
}

module.exports = WarrantyDecorator;
