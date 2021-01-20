import {
  ApiMethod,
  KeyPair,
  OrderWithClientId,
  SignableApiRequest,
  SignableOrder,
  SignableWithdrawal,
  asEcKeyPair,
  asSimpleKeyPair,
} from '@dydxprotocol/starkex-lib';

import { generateQueryPath } from '../helpers/request-helpers';
import {
  RequestMethod,
  axiosRequest,
} from '../lib/axios';
import { getAccountId } from '../lib/db';
import {
  AccountAction,
  AccountResponseObject,
  ApiFastWithdrawal,
  ApiOrder,
  ApiWithdrawal,
  Data,
  FillResponseObject,
  FundingResponseObject,
  ISO8601,
  Market,
  OrderResponseObject,
  OrderSide,
  OrderStatus,
  OrderType,
  PartialBy,
  PositionResponseObject,
  PositionStatus,
  TransferResponseObject,
  UserResponseObject,
} from '../types';

// TODO: Figure out if we can get rid of this.
const METHOD_ENUM_MAP: Record<RequestMethod, ApiMethod> = {
  [RequestMethod.DELETE]: ApiMethod.DELETE,
  [RequestMethod.GET]: ApiMethod.GET,
  [RequestMethod.POST]: ApiMethod.POST,
  [RequestMethod.PUT]: ApiMethod.PUT,
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
  ): Promise<Data> {
    const requestPath = `/v3/${endpoint}`;
    const isoTimestamp: ISO8601 = new Date().toISOString();
    const headers = {
      'DYDX-SIGNATURE': this.sign({
        requestPath,
        method,
        isoTimestamp,
        data,
      }),
      'DYDX-API-KEY': this.apiKeyPair.publicKey,
      'DYDX-TIMESTAMP': isoTimestamp,
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
    params: {},
  ): Promise<Data> {
    return this.request(RequestMethod.GET, generateQueryPath(endpoint, params));
  }

  protected async post(
    endpoint: string,
    data: {},
  ): Promise<Data> {
    return this.request(RequestMethod.POST, endpoint, data);
  }

  protected async put(
    endpoint: string,
    data: {},
  ): Promise<Data> {
    return this.request(RequestMethod.PUT, endpoint, data);
  }

  protected async delete(
    endpoint: string,
    params: {},
  ): Promise<Data> {
    return this.request(RequestMethod.DELETE, generateQueryPath(endpoint, params));
  }

  // ============ Requests ============

  /**
   * @description get a signature for the ethereumAddress if registered
   */
  async getRegistration(): Promise<{ signature: string }> {
    return this.get(
      'registration',
      {},
    );
  }

  /**
   * @description get the user associated with the ethereumAddress
   */
  async getUser(): Promise<{ user: UserResponseObject }> {
    return this.get(
      'users',
      {},
    );
  }

  /**
   * @description update information for the user
   *
   * @param {
   * @email associated with the user
   * @username for the user
   * @userData specifiying information about the user
   * }
   */
  async updateUser({
    email,
    username,
    userData,
  }: {
    email: string,
    username: string,
    userData: {},
  }): Promise<{ user: UserResponseObject }> {
    return this.put(
      'users',
      {
        email,
        username,
        userData: JSON.stringify(userData),
      },
    );
  }

  /**
   * @description create an account for an ethereumAddress
   *
   * @param starkKey for the account that will be used as the public key in starkwareEx-Lib requests
   * going forward for this account.
   */
  async createAccount(
    starkKey: string,
  ): Promise<{ account: AccountResponseObject }> {
    return this.post(
      'accounts',
      {
        starkKey,
      },
    );
  }

  /**
   * @description get account associated with an ethereumAddress and accountNumber 0
   *
   * @param ethereumAddress the account is associated with
   */
  async getAccount(ethereumAddress: string): Promise<{ account: AccountResponseObject }> {
    return this.get(
      `accounts/${getAccountId({ address: ethereumAddress })}`,
      {},
    );
  }

  /**
   * @description get all accounts associated with an ethereumAddress
   */
  async getAccounts(): Promise<{ accounts: AccountResponseObject[] }> {
    return this.get(
      'accounts',
      {},
    );
  }

  /**
   * @description get all positions for an account, meeting query parameters
   *
   * @param {
   * @market the positions are for
   * @status of the positions
   * @limit to the number of positions returned
   * @createdBeforeOrAt latest the positions could have been created
   * }
   */
  async getPositions(
    params: {
      market?: Market,
      status?: PositionStatus,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    },
  ): Promise<{ positions: PositionResponseObject[] }> {
    return this.get(
      'positions',
      params,
    );
  }

  /**
   * @description get orders for a user by a set of query parameters
   *
   * @param {
   * @market the orders are for
   * @status the orders have
   * @side of the book the orders are on
   * @type of order
   * @limit to the number of orders returned
   * @createdBeforeOrAt sets the time of the last fill that will be received   * }
   */
  async getOrders(
    params: {
      market?: Market,
      status?: OrderStatus,
      side?: OrderSide,
      type?: OrderType,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    } = {},
  ): Promise<{ orders: OrderResponseObject[] }> {
    return this.get(
      'orders',
      params,
    );
  }

  /**
   * @description get an order by a unique id
   *
   * @param orderId of the order
   */
  async getOrderById(orderId: string): Promise<{ order: OrderResponseObject }> {
    return this.get(
      `orders/${orderId}`,
      {},
    );
  }

  /**
   * @description get an order by a clientId
   *
   * @param clientId of the order
   */
  async getOrderByClientId(clientId: string): Promise<{ order: OrderResponseObject }> {
    return this.get(
      `orders/client/${clientId}`,
      {},
    );
  }

  /**
   *@description place a new order
   *
   * @param {
   * @market of the order
   * @side of the order
   * @type of the order
   * @timeInForce of the order
   * @postOnly of the order
   * @size of the order
   * @price of the order
   * @limitFee of the order
   * @expiration of the order
   * @cancelId if the order is replacing an existing one
   * @triggerPrice of the order if the order is a triggerable order
   * @trailingPercent of the order if the order is a trailing stop order
   * }
   * @param positionId associated with the order
   */
  async createOrder(
    params: PartialBy<ApiOrder, 'clientId' | 'signature'>,
    positionId: string,
  ): Promise<{ order: OrderResponseObject }> {
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
      const orderToSign: OrderWithClientId = {
        humanSize: params.size,
        humanPrice: params.price,
        limitFee: params.limitFee,
        market: params.market,
        side: params.side,
        expirationIsoTimestamp: params.expiration,
        clientId,
        positionId,
      };
      const starkOrder = SignableOrder.fromOrder(orderToSign);
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

  /**
   * @description cancel a specific order for a user by the order's unique id
   *
   * @param orderId of the order being canceled
   */
  async cancelOrder(orderId: string): Promise<void> {
    return this.delete(
      `orders/${orderId}`,
      {},
    );
  }

  /**
   * @description cancel all orders for a user for a specific market
   *
   * @param market of the orders being canceled
   */
  async cancelAllOrders(market?: Market): Promise<void> {
    const params = market ? { market } : {};
    return this.delete(
      'orders',
      params,
    );
  }

  /**
   *@description get fills for a user by a set of query parameters
   *
   * @param {
   * @market the fills are for
   * @orderId associated with the fills
   * @limit to the number of fills returned
   * @createdBeforeOrAt sets the time of the last fill that will be received
   * }
   */
  async getFills(
    params: {
      market?: Market,
      orderId?: string,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    },
  ): Promise<{ fills: FillResponseObject[] }> {
    return this.get(
      'fills',
      params,
    );
  }

  /**
   * @description get transfers for a user by a set of query parameters
   *
   * @param {
   * @type of transfer
   * @limit to the number of transfers returned
   * @createdBeforeOrAt sets the time of the last transfer that will be received
   * }
   */
  async getTransfers(
    params: {
      type?: AccountAction,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
    } = {},
  ): Promise<{ transfers: TransferResponseObject[] }> {
    return this.get(
      'transfers',
      params,
    );
  }

  /**
   * @description post a new withdrawal
   *
   * @param {
   * @amount specifies the size of the withdrawal
   * @asset specifies the asset being withdrawn
   * @toAddress is the address being withdrawn to
   * @clientId specifies the clientId for the address
   * }
   * @param positionId specifies the associated position for the transfer
   */
  async createWithdrawal(
    params: PartialBy<ApiWithdrawal, 'clientId' | 'signature'>,
    positionId: string,
  ): Promise<{ withdrawal: TransferResponseObject }> {
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
        humanAmount: params.amount,
        expirationIsoTimestamp: params.expiration,
        clientId,
        positionId,
      };
      const starkWithdrawal = SignableWithdrawal.fromWithdrawal(withdrawalToSign);
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

  /**
   * @description post a new fast-withdrawal
   *
   * @param {
    * @creditAmount specifies the size of the withdrawal
    * @debitAmount specifies the amount to be debited
    * @creditAsset specifies the asset being withdrawn
    * @toAddress is the address being withdrawn to
    * @lpPositionId is the LP positionId for the fast withdrawal
    * @clientId specifies the clientId for the address
    * @signature starkware specific signature for fast-withdrawal
    * }
    */
  createFastWithdrawal(
    params: PartialBy<ApiFastWithdrawal, 'clientId' | 'signature'>,
  ): Promise<{ withdrawal: TransferResponseObject }> {
    const clientId = params.clientId || Math.random().toString().slice(2).replace(/^0+/, '');
    // TODO meet starkware specification
    const signature = params.signature || Math.random().toString().slice(2).replace(/^0+/, '');
    const fastWithdrawal: ApiFastWithdrawal = {
      ...params,
      clientId,
      signature,
    };

    return this.post(
      'fast-withdrawals',
      fastWithdrawal,
    );
  }

  /**
   * @description get a user's funding payments by a set of query parameters
   *
   * @param {
   * @market the funding payments are for
   * @limit to the number of funding payments returned
   * @effectiveBeforeOrAt sets the latest funding payment received
   * }
   */
  async getFundingPayments(
    params: {
      market?: Market,
      limit?: number,
      effectiveBeforeOrAt?: ISO8601,
    },
  ): Promise<{ fundingPayments: FundingResponseObject }> {
    return this.get(
      'funding',
      params,
    );
  }

  // ============ Signing ============

  protected sign({
    requestPath,
    method,
    isoTimestamp,
    data,
  }: {
    requestPath: string,
    method: RequestMethod,
    isoTimestamp: ISO8601,
    data?: {},
  }): string {
    return new SignableApiRequest({
      body: data ? JSON.stringify(data) : '',
      requestPath,
      method: METHOD_ENUM_MAP[method],
      isoTimestamp,
    }).sign(this.apiKeyPair.privateKey);
  }
}
