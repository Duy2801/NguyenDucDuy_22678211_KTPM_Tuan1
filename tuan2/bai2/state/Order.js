class Order {
  setState(state) {
    this.state = state;
  }

  process() {
    this.state.handle();
  }
}

module.exports = Order;
