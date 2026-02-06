// Context cho Transaction State Pattern
class Transaction {
  constructor(transactionId, baseAmount) {
    this.transactionId = transactionId;
    this.baseAmount = baseAmount;
    this.state = null;
    this.paymentMethod = null;
  }

  setState(state) {
    this.state = state;
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
  }

  process() {
    if (!this.state) {
      console.log("  ⚠️ Chưa thiết lập trạng thái giao dịch!");
      return;
    }
    console.log(`\n[STATE: ${this.state.getStateName()}]`);
    this.state.handle(this);
  }

  getAmount() {
    return this.baseAmount;
  }

  executePayment() {
    if (!this.paymentMethod) {
      console.log("  ⚠️ Chưa chọn phương thức thanh toán!");
      return;
    }
    if (!this.state || !this.state.canProcess()) {
      console.log("  ⚠️ Không thể xử lý thanh toán trong trạng thái hiện tại!");
      return;
    }
    this.paymentMethod.execute(this.getAmount());
  }
}

module.exports = Transaction;
