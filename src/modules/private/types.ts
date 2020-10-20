export interface Private {
  getUser(): void;
  updateUser(): void;
  createAccount(): void;
  getAccounts(): void;
  getPositions(): void;
  getOrders(): void;
  getOrder(): void;
  createOrder(): void;
  deleteOrder(): void;
  cancelOrder(): void;
  cancelAllOrders(): void;
  getFills(): void;
  getTransfers(): void;
  createWithdrawal(): void;
  createDeposit(): void;
  getFundingPayments(): void;
}
