const TaxStrategy = require("./TaxStrategy");

class ConsumptionTax extends TaxStrategy {
  constructor(rate = 0.15) {
    super();
    this.rate = rate; // 15% Thuế tiêu thụ
  }

  calculate(price) {
    const tax = price * this.rate;
    console.log(`  📊 Thuế tiêu thụ (${this.rate * 100}%): ${tax} VND`);
    return tax;
  }

  getTaxName() {
    return "Thuế tiêu thụ đặc biệt";
  }

  getTaxRate() {
    return this.rate;
  }
}

module.exports = ConsumptionTax;
