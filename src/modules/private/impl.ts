/* eslint-disable @typescript-eslint/no-empty-function */
import {
  KeyPair,
  Order as StarkExOrder,
  asEcKeyPair,
  asSimpleKeyPair,
  ApiMethod,
  ApiRequest,
  OrderSide,
  OrderType,
  Asset,
} from '@dydxprotocol/starkex-lib';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { getAccountId } from '../../lib/db';
import {
  AccountAction,
  ApiOrder,
  ISO8601,
  Market,
  OrderStatus,
  PartialBy,
  PositionStatus,
} from '../../types';

// TODO: Figure out if we can get rid of this.
const METHOD_ENUM_MAP: Partial<Record<RequestMethod, ApiMethod>> = {
  [RequestMethod.DELETE]: ApiMethod.DELETE,
  [RequestMethod.GET]: ApiMethod.GET,
  [RequestMethod.POST]: ApiMethod.POST,
  // [RequestMethod.PUT]: ApiMethod.PUT,
};

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

  // ============ Request Helpers ============

  protected async request(
    endpoint: string,
    method: RequestMethod,
    data?: {},
  ): Promise<{}> {
    const requestPath = `/v3/${endpoint}`;
    const expiresAt: ISO8601 = new Date().toISOString();
    const headers = {
      'DYDX-SIGNATURE': this.generateSignature({
        requestPath,
        method,
        expiresAt,
        data,
      }),
      'DYDX-API-KEY': this.apiKeyPair.publicKey,
      'DYDX-TIMESTAMP': expiresAt,
    };
    return axiosRequest({
      url: `${this.host}${requestPath}`,
      method,
      data,
      headers,
    });
  }

  protected async get(
    endpoint: string,
  ): Promise<{}> {
    return this.request(endpoint, RequestMethod.GET);
  }

  protected async post(
    endpoint: string,
    data: {},
  ): Promise<{}> {
    return this.request(endpoint, RequestMethod.POST, data);
  }

  protected async delete(
    endpoint: string,
  ): Promise<{}> {
    return this.request(endpoint, RequestMethod.DELETE);
  }

  // ============ Requests ============

  async getUser(): Promise<{}> {
    return this.get(
      'users',
    );
  }

  // TODO: Remove.
  async createUser(
    userData?: {},
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

  async getAccount(ethereumAddress: string): Promise<{}> {
    return this.get(
      `accounts/${getAccountId({ address: ethereumAddress })}`,
    );
  }

  async getPositions(
    params: {
      market?: Market,
      status?: PositionStatus,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    },
  ): Promise<{}> {
    return this.get(
      this.generateQueryPath('positions', params),
    );
  }

  async getOrders(
    params: {
      market?: Market,
      status?: OrderStatus,
      side?: OrderSide,
      type?: OrderType,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    },
  ): Promise<{}> {
    return this.get(
      this.generateQueryPath('orders', params),
    );
  }

  async getOrderById(orderId: string): Promise<{}> {
    return this.get(
      `orders/${orderId}`,
    );
  }

  async getOrderByClientId(clientId: string): Promise<{}> {
    return this.get(
      `orders/client/${clientId}`,
    );
  }

  async createOrder(
    params: PartialBy<ApiOrder, 'clientId' | 'signature'>,
    positionId: string,
    ethereumAddress: string,
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
        accountId: getAccountId({ address: ethereumAddress }),
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

  async deleteOrder(orderId: string): Promise<{}> {
    return this.delete(
      `orders/${orderId}`,
    );
  }

  async deleteAllOrders(params: { market?: Market }): Promise<{}> {
    return this.delete(
      this.generateQueryPath('orders', params),
    );
  }

  async getFills(
    params: {
      market?: Market,
      orderId?: string,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    },
  ): Promise<{}> {
    return this.get(
      this.generateQueryPath('fills', params),
    );
  }

  async getTransfers(
    params: {
      type?: AccountAction,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    },
  ): Promise<{}> {
    return this.get(
      this.generateQueryPath('transfers', params),
    );
  }

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

  async createDeposit(
    params: {
      amount: string,
      asset: Asset,
      fromAddress: string,
    },
  ): Promise<{}> {
    return this.post(
      'deposits',
      params,
    );
  }

  async getFundingPayments(
    params: {
      market?: Market,
      limit?: number,
      effectiveBeforeOrAt?: ISO8601,
    },
  ): Promise<{}> {
    return this.get(
      this.generateQueryPath('funding', params),
    );
  }

  // ============ Request Generation Helpers ============

  private generateSignature({
    requestPath,
    method,
    expiresAt,
    data,
  }: {
    requestPath: string,
    method: RequestMethod,
    expiresAt: ISO8601,
    data?: {},
  }): string {
    const apiMethod = METHOD_ENUM_MAP[method];
    // TODO: Shouldn't need this.
    if (!apiMethod) {
      throw new Error(`Unsupported method: ${method}`);
    }
    return ApiRequest.fromInternal({
      body: data ? JSON.stringify(data) : '',
      requestPath,
      method: apiMethod,
      publicKey: this.apiKeyPair.publicKey,
      expiresAt,
    }).sign(this.apiKeyPair.privateKey);
  }

  private generateQueryPath(url: string, params: {}): string {
    const entries = Object.entries(params);
    if (!entries.length) {
      return url;
    }

    const paramsString = entries.map(
      (kv) => `${kv[0]}=${kv[1]}`,
    ).join('&');
    return `${url}?${paramsString}`;
  }
}
