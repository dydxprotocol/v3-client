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
  Withdrawal as StarkExWithdrawal,
} from '@dydxprotocol/starkex-lib';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { getAccountId } from '../../lib/db';
import {
  AccountAction,
  ApiOrder,
  ApiWithdrawal,
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
    method: RequestMethod,
    endpoint: string,
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
    return this.request(RequestMethod.GET, endpoint);
  }

  protected async post(
    endpoint: string,
    data: {},
  ): Promise<{}> {
    return this.request(RequestMethod.POST, endpoint, data);
  }

  protected async put(
    endpoint: string,
    data: {},
  ): Promise<{}> {
    return this.request(RequestMethod.PUT, endpoint, data);
  }

  protected async delete(
    endpoint: string,
  ): Promise<{}> {
    return this.request(RequestMethod.DELETE, endpoint);
  }

  // ============ Requests ============

  async getRegistration(): Promise<{}> {
    return this.get(
      'users',
    );
  }

  async getUser(): Promise<{}> {
    return this.get(
      'users',
    );
  }

  async updateUser(
    userData: {},
  ): Promise<{}> {
    return this.put(
      'users',
      {
        userData: JSON.stringify(userData),
      },
    );
  }

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
    } = {},
  ): Promise<{}[]> {
    return this.get(
      this.generateQueryPath('orders', params),
    ) as unknown as {}[];
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
      const starkOrder: StarkExOrder = StarkExOrder.fromInternal(orderToSign);
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

  async cancelOrder(orderId: string): Promise<{}> {
    return this.delete(
      `orders/${orderId}`,
    );
  }

  async cancelAllOrders(market?: Market): Promise<{}> {
    const params = market ? { market } : {};
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

  async createWithdrawal(
    params: PartialBy<ApiWithdrawal, 'clientId' | 'signature'>,
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
        throw new Error(
          'Withdrawal is not signed and client was not initialized with starkPrivateKey',
        );
      }
      const withdrawalToSign = {
        ...params,
        clientId,
        starkKey: this.starkKeyPair.publicKey,
        debitAmount: params.amount,
        expiresAt: params.expiration,
        positionId,
      };
      const starkWithdrawal: StarkExWithdrawal = StarkExWithdrawal.fromInternal(withdrawalToSign);
      signature = starkWithdrawal.sign(this.starkKeyPair);
    }

    const withdrawal: ApiWithdrawal = {
      ...params,
      clientId,
      signature,
    };

    return this.post(
      'withdrawals',
      withdrawal,
    );
  }

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
