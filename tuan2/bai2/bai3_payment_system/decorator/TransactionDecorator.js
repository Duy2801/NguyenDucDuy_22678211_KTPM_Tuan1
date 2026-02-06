// Base Decorator cho giao dịch
class TransactionDecorator {
  constructor(transaction) {
    this.transaction = transaction;
  }

  getAmount() {
    return this.transaction.getAmount();
  }

  setState(state) {
    this.transaction.setState(state);
  }

  setPaymentMethod(method) {
    this.transaction.setPaymentMethod(method);
  }

  process() {
    this.transaction.process();
  }

  executePayment() {
    this.transaction.executePayment();
  }

  get transactionId() {
    return this.transaction.transactionId;
  }
}

module.exports = TransactionDecorator;
