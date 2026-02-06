// Base State cho giao dịch
class TransactionState {
  handle(transaction) {
    throw new Error("Method handle() must be implemented");
  }

  getStateName() {
    throw new Error("Method getStateName() must be implemented");
  }

  canProcess() {
    return true;
  }
}

module.exports = TransactionState;
