const ProductState = require("./ProductState");

class SoldProductState extends ProductState {
  handle(product) {
    console.log("  ✅ Sản phẩm đã bán - Tính thuế đầy đủ");
  }

  getStateName() {
    return "Đã bán";
  }

  getPriceMultiplier() {
    return 1.0; // Giá bán bình thường 100%
  }
}

module.exports = SoldProductState;
