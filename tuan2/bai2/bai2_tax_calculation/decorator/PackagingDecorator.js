const ProductDecorator = require("./ProductDecorator");

class PackagingDecorator extends ProductDecorator {
  constructor(product, packagingFee = 15000) {
    super(product);
    this.packagingFee = packagingFee;
  }

  getTotalPrice() {
    const total = this.product.getTotalPrice() + this.packagingFee;
    console.log(`  📦 Phí đóng gói: +${this.packagingFee} VND`);
    return total;
  }
}

module.exports = PackagingDecorator;
