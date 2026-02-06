const TaxStrategy = require("./TaxStrategy");

class LuxuryTax extends TaxStrategy {
  constructor(rate = 0.25) {
    super();
    this.rate = rate; // 25% Thuế xa xỉ
  }

  calculate(price) {
    const tax = price * this.rate;
    console.log(`  📊 Thuế xa xỉ (${this.rate * 100}%): ${tax} VND`);
    return tax;
  }

  getTaxName() {
    return "Thuế hàng xa xỉ";
  }

  getTaxRate() {
    return this.rate;
  }
}

module.exports = LuxuryTax;
