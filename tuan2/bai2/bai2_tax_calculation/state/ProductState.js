// Base State cho sản phẩm
class ProductState {
  handle(product) {
    throw new Error("Method handle() must be implemented");
  }

  getStateName() {
    throw new Error("Method getStateName() must be implemented");
  }

  getPriceMultiplier() {
    return 1.0; // Mặc định không thay đổi giá
  }
}

module.exports = ProductState;
