const TaxStrategy = require("./TaxStrategy");

class VATTax extends TaxStrategy {
  constructor(rate = 0.1) {
    super();
    this.rate = rate; // 10% VAT
  }

  calculate(price) {
    const tax = price * this.rate;
    console.log(`  📊 Thuế VAT (${this.rate * 100}%): ${tax} VND`);
    return tax;
  }

  getTaxName() {
    return "VAT (Thuế giá trị gia tăng)";
  }

  getTaxRate() {
    return this.rate;
  }
}

module.exports = VATTax;
