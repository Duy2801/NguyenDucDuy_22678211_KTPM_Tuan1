class ShoppingCart {
  setPaymentStrategy(strategy) {
    this.strategy = strategy;
  }

  checkout(amount) {
    this.strategy.pay(amount);
  }
}

module.exports = ShoppingCart;
