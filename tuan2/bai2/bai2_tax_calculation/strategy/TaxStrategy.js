// Base Strategy cho tính thuế
class TaxStrategy {
  calculate(price) {
    throw new Error("Method calculate() must be implemented");
  }

  getTaxName() {
    throw new Error("Method getTaxName() must be implemented");
  }

  getTaxRate() {
    throw new Error("Method getTaxRate() must be implemented");
  }
}

module.exports = TaxStrategy;
