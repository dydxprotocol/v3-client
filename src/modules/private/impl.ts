import {
  KeyPair,
} from '@dydxprotocol/starkex-lib';

import {
  Private,
} from './types';

export default class PrivateImpl implements Private {
  readonly apiPrivateKey: string | KeyPair;
  readonly starkPrivateKey?: string | KeyPair;

  constructor(
    apiPrivateKey: string | KeyPair,
    starkPrivateKey?: string | KeyPair,
  ) {
    this.apiPrivateKey = apiPrivateKey;
    this.starkPrivateKey = starkPrivateKey;
  }

  getUser(): void {}
  updateUser(): void {}
  createAccount(): void {}
  getAccounts(): void {}
  getPositions(): void {}
  getOrders(): void {}
  getOrder(): void {}
  createOrder(): void {}
  deleteOrder(): void {}
  cancelOrder(): void {}
  cancelAllOrders(): void {}
  getFills(): void {}
  getTransfers(): void {}
  createWithdrawal(): void {}
  createDeposit(): void {}
  getFundingPayments(): void {}
}
