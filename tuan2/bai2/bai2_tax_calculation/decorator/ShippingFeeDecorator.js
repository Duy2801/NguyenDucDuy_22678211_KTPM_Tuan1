const ProductDecorator = require("./ProductDecorator");

class ShippingFeeDecorator extends ProductDecorator {
  constructor(product, shippingFee = 30000) {
    super(product);
    this.shippingFee = shippingFee;
  }

  getTotalPrice() {
    const total = this.product.getTotalPrice() + this.shippingFee;
    console.log(`  🚚 Phí vận chuyển: +${this.shippingFee} VND`);
    return total;
  }
}

module.exports = ShippingFeeDecorator;
