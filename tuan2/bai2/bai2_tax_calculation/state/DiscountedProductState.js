const ProductState = require("./ProductState");

class DiscountedProductState extends ProductState {
  handle(product) {
    console.log("  🏷️ Sản phẩm giảm giá - Giảm 20% giá gốc");
  }

  getStateName() {
    return "Giảm giá";
  }

  getPriceMultiplier() {
    return 0.8; // Giảm 20% = còn 80%
  }
}

module.exports = DiscountedProductState;
