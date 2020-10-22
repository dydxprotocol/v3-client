/* eslint-disable @typescript-eslint/no-empty-function */
import {
  KeyPair,
  Order as StarkExOrder,
  asEcKeyPair,
  asSimpleKeyPair,
  ApiMethod,
  ApiRequest,
} from '@dydxprotocol/starkex-lib';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { getAccountId } from '../../lib/db';
import {
  ApiOrder,
  PartialBy,
} from '../../types';

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
  ): Promise<{}> {
    const url: string = `${this.host}/v3/${endpoint}`;
    return axiosRequest({
      url,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-SIGNATURE': this.generateSignature({
          requestPath: url,
          method: ApiMethod.POST,
          body: data,
        }),
        'DYDX-API-KEY': this.apiKeyPair.publicKey,
        'DYDX-TIMESTAMP': new Date().toISOString(),
      },
    });
  }

  protected async get(
    endpoint: string,
  ): Promise<{}> {
    const url: string = `${this.host}/v3/${endpoint}`;
    return axiosRequest({
      url,
      method: RequestMethod.GET,
      headers: {
        'DYDX-SIGNATURE': this.generateSignature({
          requestPath: url,
          method: ApiMethod.GET,
        }),
        'DYDX-API-KEY': this.apiKeyPair.publicKey,
        'DYDX-TIMESTAMP': new Date().toISOString(),
      },
    });
  }

  async getUser(): Promise<{}> {
    return this.get(
      'users',
    );
  }

  // TODO: Remove.
  async createUser(
    userData: JSON,
  ): Promise<{}> {
    return this.post(
      'users',
      {
        userData,
      },
    );
  }

  async updateUser(): Promise<void> {} // NOT in Librarian yet

  async createAccount(
    starkKey: string,
  ): Promise<{}> {
    return this.post(
      'accounts',
      {
        starkKey,
      },
    );
  }

  async getAccountById(ethereumAddress: string): Promise<{}> {
    return this.get(
      `accounts/${getAccountId({ address: ethereumAddress })}`,
    );
  }

  async getPositions(): Promise<void> {}
  async getOrders(): Promise<void> {}
  async getOrder(): Promise<void> {}

  async createOrder(
    params: PartialBy<ApiOrder, 'clientId' | 'signature'>,
    positionId: string,
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
    );
  }

  async deleteOrder(): Promise<void> {}
  async cancelOrder(): Promise<void> {}
  async cancelAllOrders(): Promise<void> {}
  async getFills(): Promise<void> {}
  async getTransfers(): Promise<void> {}

  // TODO: Fix. See createOrder above.
  // async createWithdrawal(
  //   params: PartialBy<ApiWithdrawal, 'clientId' | 'signature'>,
  // ): Promise<{}> {
  //   const possiblyUnsignedWithdrawal: PartialBy<ApiWithdrawal, 'signature'> = {
  //     ...params,
  //     clientId: params.clientId || Math.random().toString().slice(2),
  //     // TODO: Allow clientId to be a string.
  //     // clientId: params.clientId || Math.random().toString(36).slice(2),
  //   };
  //   let signature: string | undefined = params.signature;
  //   if (!signature) {
  //     if (!this.starkKeyPair) {
  //       throw new Error(
  //         'Withdrawal is not signed and client was not initialized with starkPrivateKey',
  //       );
  //     }
  //     signature = StarkExWithdrawal.fromInternal({
  //       ...possiblyUnsignedWithdrawal,
  //       expiresAt: params.expiration,
  //     }).sign(this.starkKeyPair);
  //   }
  //   return this.post('withdrawals', {
  //     ...possiblyUnsignedWithdrawal,
  //     signature,
  //   });
  // }

  async createDeposit(): Promise<void> {}

  async getFundingPayments(): Promise<void> {}

  private generateSignature({
    requestPath,
    method,
    body = {},
  }: {
    requestPath: string,
    method: ApiMethod,
    body?: {},
  }): string {
    return ApiRequest.fromInternal({
      body: JSON.stringify(body),
      requestPath,
      method,
      publicKey: this.apiKeyPair.publicKey,
      expiresAt: new Date().toISOString(),
    }).sign(this.apiKeyPair.privateKey);
  }
}
