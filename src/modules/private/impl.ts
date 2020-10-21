import {
  KeyPair,
  Order as StarkExOrder,
  Withdrawal as StarkExWithdrawal,
  asEcKeyPair,
  asSimpleKeyPair,
} from '@dydxprotocol/starkex-lib';

import {
  ApiOrder,
  ApiWithdrawal,
  PartialBy,
} from '../../types';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { getUserId } from '../../lib/db';

export default class Private {
  readonly host: string;
  readonly apiKeyPair: KeyPair;
  readonly starkKeyPair?: KeyPair;

  constructor(
    host: string,
    apiPrivateKey: string | KeyPair,
    starkPrivateKey?: string | KeyPair,
  ) {
    this.host = host;
    this.apiKeyPair = asSimpleKeyPair(asEcKeyPair(apiPrivateKey));
    if (starkPrivateKey) {
      this.starkKeyPair = asSimpleKeyPair(asEcKeyPair(starkPrivateKey));
    }
  }

  protected async post(
    endpoint: string,
    data: {},
    headers: {} = {},
  ): Promise<{}> {
    // TODO: Sign with API key.
    return axiosRequest({
      url: `${this.host}/v3/${endpoint}`,
      method: RequestMethod.POST,
      data,
      headers,
    });
  }

  async getUser(): Promise<void> {}

  // TODO: Remove.
  async createUser(
    ethereumAddress: string,
  ): Promise<{}> {
    return this.post(
      'users',
      {},
      {
        signature: 'mock-signature',
        ethereumAddress,
        expiration: new Date().toISOString(),
      }
    );
  }

  async updateUser(): Promise<void> {}

  async createAccount(
    ethereumAddress: string,
    starkKey: string,
  ): Promise<{}> {
    const userId = getUserId(ethereumAddress);
    return this.post(
      'accounts',
      {
        starkKey,
      },
      {
        signature: 'mock-signature',
        userId,
        expiration: new Date().toISOString(),
      },
    );
  }

  async getAccounts(): Promise<void> {}
  async getPositions(): Promise<void> {}
  async getOrders(): Promise<void> {}
  async getOrder(): Promise<void> {}

  async createOrder(
    params: PartialBy<ApiOrder, 'clientId' | 'signature'>,
    positionId: string,
    ethereumAddress: string, // TODO: Don't require this.
  ): Promise<{}> {
    // TODO: Allow clientId to be a string.
    // const clientId = params.clientId || Math.random().toString(36).slice(2);
    //
    // Have to strip leading zeroes since clientId is being mis-processed as a number.
    const clientId = params.clientId || Math.random().toString().slice(2).replace(/^0+/, '');

    let signature: string | undefined = params.signature;
    if (!signature) {
      if (!this.starkKeyPair) {
        throw new Error('Order is not signed and client was not initialized with starkPrivateKey');
      }
      const orderToSign = {
        ...params,
        clientId,
        positionId,
        starkKey: this.starkKeyPair.publicKey,
        expiresAt: params.expiration,
      };
      const starkOrder = StarkExOrder.fromInternal(orderToSign);
      signature = starkOrder.sign(this.starkKeyPair);
    }

    const order: ApiOrder = {
      ...params,
      clientId,
      signature,
    };

    return this.post(
      'orders',
      order,
      {
        owner: ethereumAddress,
      },
    );
  }

  async deleteOrder(): Promise<void> {}
  async cancelOrder(): Promise<void> {}
  async cancelAllOrders(): Promise<void> {}
  async getFills(): Promise<void> {}
  async getTransfers(): Promise<void> {}

  async createWithdrawal(
    params: PartialBy<ApiWithdrawal, 'clientId' | 'signature'>,
  ): Promise<{}> {
    const possiblyUnsignedWithdrawal: PartialBy<ApiWithdrawal, 'signature'> = {
      ...params,
      clientId: params.clientId || Math.random().toString().slice(2),
      // TODO: Allow clientId to be a string.
      // clientId: params.clientId || Math.random().toString(36).slice(2),
    };
    let signature: string | undefined = params.signature;
    if (!signature) {
      if (!this.starkKeyPair) {
        throw new Error('Withdrawal is not signed and client was not initialized with starkPrivateKey');
      }
      signature = StarkExWithdrawal.fromInternal({
        ...possiblyUnsignedWithdrawal,
        expiresAt: params.expiration,
      }).sign(this.starkKeyPair);
    }
    return this.post('withdrawals', {
      ...possiblyUnsignedWithdrawal,
      signature,
    });
  }

  async createDeposit(): Promise<void> {}

  async getFundingPayments(): Promise<void> {}
}
