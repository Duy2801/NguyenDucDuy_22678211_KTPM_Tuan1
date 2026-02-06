const ProductState = require("./ProductState");

class NewProductState extends ProductState {
  handle(product) {
    console.log("  🆕 Sản phẩm mới - Giá gốc không thay đổi");
  }

  getStateName() {
    return "Sản phẩm mới";
  }

  getPriceMultiplier() {
    return 1.0; // Giá gốc 100%
  }
}

module.exports = NewProductState;
