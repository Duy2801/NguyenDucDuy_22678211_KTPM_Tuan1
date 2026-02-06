// Context cho Product State Pattern
class Product {
  constructor(name, basePrice) {
    this.name = name;
    this.basePrice = basePrice;
    this.state = null;
    this.taxStrategy = null;
  }

  setState(state) {
    this.state = state;
  }

  setTaxStrategy(strategy) {
    this.taxStrategy = strategy;
  }

  process() {
    if (!this.state) {
      console.log("  ⚠️ Chưa thiết lập trạng thái cho sản phẩm!");
      return;
    }
    console.log(`\n[STATE: ${this.state.getStateName()}]`);
    this.state.handle(this);
  }

  getPrice() {
    return this.basePrice * this.state.getPriceMultiplier();
  }

  calculateTax() {
    if (!this.taxStrategy) {
      console.log("  ⚠️ Chưa chọn loại thuế!");
      return 0;
    }
    const price = this.getPrice();
    const tax = this.taxStrategy.calculate(price);
    return tax;
  }

  getTotalPrice() {
    return this.getPrice() + this.calculateTax();
  }
}

module.exports = Product;
