// Base Decorator cho sản phẩm
class ProductDecorator {
  constructor(product) {
    this.product = product;
  }

  getTotalPrice() {
    return this.product.getTotalPrice();
  }

  setState(state) {
    this.product.setState(state);
  }

  setTaxStrategy(strategy) {
    this.product.setTaxStrategy(strategy);
  }

  process() {
    this.product.process();
  }

  calculateTax() {
    return this.product.calculateTax();
  }

  getPrice() {
    return this.product.getPrice();
  }

  get name() {
    return this.product.name;
  }
}

module.exports = ProductDecorator;
