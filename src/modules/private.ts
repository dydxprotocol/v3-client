import crypto from 'crypto';

import { StarkwareLib } from '@dydxprotocol/starkex-eth';
import {
  ApiMethod,
  asEcKeyPair,
  asSimpleKeyPair,
  KeyPair,
  nonceFromClientId,
  OrderWithClientId,
  SignableConditionalTransfer,
  SignableOrder,
  SignableTransfer,
  SignableWithdrawal,
  TransferParams as StarklibTransferParams,
} from '@dydxprotocol/starkex-lib';
import _ from 'lodash';

import {
  generateQueryPath,
  generateRandomClientId,
} from '../helpers/request-helpers';
import {
  axiosRequest,
  RequestMethod,
} from '../lib/axios';
import { getAccountId } from '../lib/db';
import {
  AccountAction,
  AccountLeaderboardPnlPeriod,
  AccountLeaderboardPnlResponseObject,
  AccountResponseObject,
  ActiveOrderResponseObject,
  ApiFastWithdrawal,
  ApiFastWithdrawalParams,
  ApiKeyCredentials,
  ApiOrder,
  ApiTransfer,
  ApiWithdrawal,
  Data,
  FillResponseObject,
  FundingResponseObject,
  GenericParams,
  HistoricalLeaderboardPnlsResponseObject,
  HistoricalPnlResponseObject,
  ISO31661ALPHA2,
  ISO6391,
  ISO8601,
  LinkAction,
  LiquidityProviderRewardsResponseObject,
  LiquidityProviderRewardsV2ResponseObject,
  Market,
  OrderResponseObject,
  OrderSide,
  OrderStatus,
  OrderType,
  PartialBy,
  PositionResponseObject,
  PositionStatus,
  ProfilePrivateResponseObject,
  Provider,
  RestrictionResponseObject,
  RetroactiveMiningRewardsResponseObject,
  TradingRewardsResponseObject,
  TransferParams,
  TransferResponseObject,
  UserComplianceResponseObject,
  UserLinkRequestsResponseObject,
  UserLinksResponseObject,
  UserResponseObject,
} from '../types';
import Clock from './clock';

// TODO: Figure out if we can get rid of this.
const METHOD_ENUM_MAP: Record<RequestMethod, ApiMethod> = {
  [RequestMethod.DELETE]: ApiMethod.DELETE,
  [RequestMethod.GET]: ApiMethod.GET,
  [RequestMethod.POST]: ApiMethod.POST,
  [RequestMethod.PUT]: ApiMethod.PUT,
};

const collateralTokenDecimals = 6;

export default class Private {
  readonly host: string;
  readonly apiKeyCredentials: ApiKeyCredentials;
  readonly networkId: number;
  readonly starkLib: StarkwareLib;
  readonly starkKeyPair?: KeyPair;
  readonly clock: Clock;

  constructor({
    host,
    apiKeyCredentials,
    starkPrivateKey,
    networkId,
    clock,
  }: {
    host: string,
    apiKeyCredentials: ApiKeyCredentials,
    networkId: number,
    starkPrivateKey?: string | KeyPair,
    clock: Clock,
  }) {
    this.host = host;
    this.apiKeyCredentials = apiKeyCredentials;
    this.networkId = networkId;
    this.starkLib = new StarkwareLib({} as Provider, networkId);
    if (starkPrivateKey) {
      this.starkKeyPair = asSimpleKeyPair(asEcKeyPair(starkPrivateKey));
    }
    this.clock = clock;
  }

  // ============ Request Helpers ============

  protected async request(
    method: RequestMethod,
    endpoint: string,
    data?: {},
  ): Promise<Data> {
    const requestPath = `/v3/${endpoint}`;
    const isoTimestamp: ISO8601 = this.clock.getAdjustedIsoString();
    const headers = {
      'DYDX-SIGNATURE': this.sign({
        requestPath,
        method,
        isoTimestamp,
        data,
      }),
      'DYDX-API-KEY': this.apiKeyCredentials.key,
      'DYDX-TIMESTAMP': isoTimestamp,
      'DYDX-PASSPHRASE': this.apiKeyCredentials.passphrase,
    };
    return axiosRequest({
      url: `${this.host}${requestPath}`,
      method,
      data,
      headers,
    });
  }

  protected async _get(
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

  async get(endpoint: string, params: {}): Promise<Data> {
    return this._get(
      endpoint,
      params,
    );
  }

  /**
   * @description get a signature for the ethereumAddress if registered
   */
  async getRegistration(genericParams: GenericParams = {}): Promise<{ signature: string }> {
    return this._get(
      'registration',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description get the user associated with the ethereumAddress
   */
  async getUser(genericParams: GenericParams = {}): Promise<{ user: UserResponseObject }> {
    return this._get(
      'users',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description update information for the user
   *
   * @params {
   * @userData specifiying information about the user
   * @email associated with the user
   * @username for the user
   * @isSharingUsername if the user wants their username publicly shared
   * @isSharingAddress if the user wants their ethereumAddress publicly shared
   * @country for the user (ISO 3166-1 Alpha-2 Compliant)
   * @languageCode for the user (ISO 639-1 Compliant, including 'zh-CN')
   * }
   */
  async updateUser({
    userData,
    email,
    username,
    isSharingUsername,
    isSharingAddress,
    country,
    languageCode,
  }: {
    userData: {},
    email?: string | null,
    username?: string,
    isSharingUsername?: boolean,
    isSharingAddress?: boolean,
    country?: ISO31661ALPHA2,
    languageCode?: ISO6391,
  }): Promise<{ user: UserResponseObject }> {
    return this.put(
      'users',
      {
        email,
        username,
        isSharingUsername,
        isSharingAddress,
        userData: JSON.stringify(userData),
        country,
        languageCode,
      },
    );
  }

  /**
   * @description create an account for an ethereumAddress
   *
   * @param starkKey for the account that will be used as the public key in starkwareEx-Lib requests
   * going forward for this account.
   * @param starkKeyYCoordinate for the account that will be used as the Y coordinate for the public
   * key in starkwareEx-Lib requests going forward for this account.
   */
  async createAccount(
    starkKey: string,
    starkKeyYCoordinate: string,
  ): Promise<{ account: AccountResponseObject }> {
    return this.post(
      'accounts',
      {
        starkKey,
        starkKeyYCoordinate,
      },
    );
  }

  /**
   * @description get account associated with an ethereumAddress and accountNumber 0
   *
   * @param ethereumAddress the account is associated with
   */
  async getAccount(
    ethereumAddress: string,
    genericParams: GenericParams = {},
  ): Promise<{ account: AccountResponseObject }> {
    return this._get(
      `accounts/${getAccountId({ address: ethereumAddress })}`,
      { ...genericParams },
    );
  }

  /**
   * @description get all accounts associated with an ethereumAddress
   */
  async getAccounts(
    genericParams: GenericParams = {},
  ): Promise<{ accounts: AccountResponseObject[] }> {
    return this._get(
      'accounts',
      { ...genericParams },
    );
  }

  /**
   * @description get leaderboard pnl for period
   *
   * @param period the period of pnls to retrieve
   */
  async getAccountLeaderboardPnl(
    period: AccountLeaderboardPnlPeriod,
    params: {
      startedBeforeOrAt?: ISO8601,
    },
    genericParams: GenericParams = {},
  ): Promise<{ leaderboardPnl: AccountLeaderboardPnlResponseObject }> {
    return this._get(
      `accounts/leaderboard-pnl/${period}`,
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get historical leaderboard pnls for period
   *
   * @param period the period of pnls to retrieve
   */
  async getAccountHistoricalLeaderboardPnl(
    period: AccountLeaderboardPnlPeriod,
    params: {
      limit?: number,
    },
    genericParams: GenericParams = {},
  ): Promise<HistoricalLeaderboardPnlsResponseObject> {
    return this._get(
      `accounts/historical-leaderboard-pnls/${period}`,
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get all positions for an account, meeting query parameters
   *
   * @params {
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
    genericParams: GenericParams = {},
  ): Promise<{ positions: PositionResponseObject[] }> {
    return this._get(
      'positions',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get orders for a user by a set of query parameters
   *
   * @params {
   * @market the orders are for
   * @status the orders have
   * @side of the book the orders are on
   * @type of order
   * @limit to the number of orders returned
   * @createdBeforeOrAt sets the time of the last fill that will be received
   * @returnLatestOrders returns the latest orders instead of the oldest and the order is
   * from most recent to least recent (up to limit)
   * }
   */
  async getOrders(
    params: {
      market?: Market,
      status?: OrderStatus,
      side?: OrderSide,
      type?: OrderType,
      limit?: number,
      createdBeforeOrAt?: ISO8601,
      returnLatestOrders?: boolean,
    } = {},
    genericParams: GenericParams = {},
  ): Promise<{ orders: OrderResponseObject[] }> {
    return this._get(
      'orders',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get active orders (PENDING, OPEN, UNTRIGGERED) for a user by a set of query
   * parameters - if id is included then side is required
   *
   * @params {
   * @market the orders are for
   * @side of the book the orders are on
   * @id of the order
   * }
   */
  async getActiveOrders(
    market: Market,
    side?: OrderSide,
    id?: string,
    genericParams: GenericParams = {},
  ): Promise<{ orders: ActiveOrderResponseObject[] }> {
    return this._get(
      'active-orders',
      {
        market,
        side,
        id,
        ...genericParams,
      },
    );
  }

  /**
   * @description get an order by a unique id
   *
   * @param orderId of the order
   */
  async getOrderById(
    orderId: string,
    genericParams: GenericParams = {},
  ): Promise<{ order: OrderResponseObject }> {
    return this._get(
      `orders/${orderId}`,
      { ...genericParams },
    );
  }

  /**
   * @description get an order by a clientId
   *
   * @param clientId of the order
   */
  async getOrderByClientId(
    clientId: string,
    genericParams: GenericParams = {},
  ): Promise<{ order: OrderResponseObject }> {
    return this._get(
      `orders/client/${clientId}`,
      { ...genericParams },
    );
  }

  /**
   *@description place a new order
   *
   * @params {
   * @market of the order
   * @side of the order
   * @type of the order
   * @timeInForce of the order
   * @postOnly of the order
   * @size of the order
   * @price of the order
   * @limitFee of the order
   * @expiration of the order
   * @reduceOnly whether the order is reduce-only (optional)
   * @cancelId if the order is replacing an existing one
   * @triggerPrice of the order if the order is a triggerable order
   * @trailingPercent of the order if the order is a trailing stop order
   * }
   * @param positionId associated with the order
   */
  async createOrder(
    params: PartialBy<ApiOrder, 'clientId' | 'signature'>,
    positionId: string,
    genericParams: GenericParams = {},
  ): Promise<{ order: OrderResponseObject }> {
    const clientId = params.clientId || generateRandomClientId();

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
      const starkOrder = SignableOrder.fromOrder(orderToSign, this.networkId);
      signature = await starkOrder.sign(this.starkKeyPair);
    }

    const order: ApiOrder = {
      ...params,
      clientId,
      signature,
    };

    return this.post(
      'orders',
      {
        ...order,
        ...genericParams,
      },
    );
  }

  /**
   * @description cancel a specific order for a user by the order's unique id
   *
   * @param orderId of the order being canceled
   */
  async cancelOrder(orderId: string): Promise<{ cancelOrder: OrderResponseObject }> {
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
  async cancelAllOrders(market?: Market): Promise<{ cancelOrders: OrderResponseObject[] }> {
    const params = market ? { market } : {};
    return this.delete(
      'orders',
      params,
    );
  }

  /**
   * @description cancel active orders (PENDING, OPEN, UNTRIGGERED) for a user by a set of query
   * parameters - if id is included then side is required
   *
   * @params {
   * @market the orders are for
   * @side of the book the orders are on
   * @id of the order
   * }
   */
  async cancelActiveOrders(
    market: Market,
    side?: OrderSide,
    id?: string,
    genericParams: GenericParams = {},
  ): Promise<{ cancelOrders: ActiveOrderResponseObject[] }> {
    return this.delete(
      'active-orders',
      {
        market,
        side,
        id,
        ...genericParams,
      },
    );
  }

  /**
   *@description get fills for a user by a set of query parameters
   *
   * @params {
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
    genericParams: GenericParams = {},
  ): Promise<{ fills: FillResponseObject[] }> {
    return this._get(
      'fills',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get transfers for a user by a set of query parameters
   *
   * @params {
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
    genericParams: GenericParams = {},
  ): Promise<{ transfers: TransferResponseObject[] }> {
    return this._get(
      'transfers',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description post a new withdrawal
   *
   * @params {
   * @amount specifies the size of the withdrawal
   * @asset specifies the asset being withdrawn
   * @clientId specifies the clientId for the address
   * }
   * @param positionId specifies the associated position for the transfer
   */
  async createWithdrawal(
    params: PartialBy<ApiWithdrawal, 'clientId' | 'signature'>,
    positionId: string,
  ): Promise<{ withdrawal: TransferResponseObject }> {
    const clientId = params.clientId || generateRandomClientId();

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
      const starkWithdrawal = SignableWithdrawal.fromWithdrawal(withdrawalToSign, this.networkId);
      signature = await starkWithdrawal.sign(this.starkKeyPair);
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
   * @params {
   * @creditAmount specifies the size of the withdrawal
   * @debitAmount specifies the amount to be debited
   * @creditAsset specifies the asset being withdrawn
   * @toAddress is the address being withdrawn to
   * @lpPositionId is the LP positionId for the fast withdrawal
   * @clientId specifies the clientId for the address
   * @signature starkware specific signature for fast-withdrawal
   * }
   */
  async createFastWithdrawal(
    {
      lpStarkKey,
      ...params
    }: PartialBy<ApiFastWithdrawalParams, 'clientId' | 'signature'>,
    positionId: string,
  ): Promise<{ withdrawal: TransferResponseObject }> {
    const clientId = params.clientId || generateRandomClientId();
    let signature: string | undefined = params.signature;
    if (!signature) {
      if (!this.starkKeyPair) {
        throw new Error('Fast withdrawal is not signed and client was not initialized with starkPrivateKey');
      }
      const fact = this.starkLib.factRegistry.getTransferErc20Fact({
        recipient: params.toAddress,
        tokenAddress: this.starkLib.collateralToken.getAddress(),
        tokenDecimals: collateralTokenDecimals,
        humanAmount: params.creditAmount,
        salt: nonceFromClientId(clientId),
      });
      const transferToSign = {
        senderPositionId: positionId,
        receiverPositionId: params.lpPositionId,
        receiverPublicKey: lpStarkKey,
        factRegistryAddress: this.starkLib.factRegistry.getAddress(),
        fact,
        humanAmount: params.debitAmount,
        clientId,
        expirationIsoTimestamp: params.expiration,
      };
      const starkConditionalTransfer = SignableConditionalTransfer.fromTransfer(
        transferToSign,
        this.networkId,
      );
      signature = await starkConditionalTransfer.sign(this.starkKeyPair);
    }
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
   * @description post a new transfer
   *
   * @params {
   * @amount specifies the size of the transfer
   * @receiverAccountId specifies the receiver account id
   * @receiverPublicKey specifies the receiver public key
   * @receiverPositionId specifies the receiver position id
   * @clientId specifies the clientId for the address
   * @signature starkware specific signature for the transfer
   * }
   * @param positionId specifies the associated position for the transfer
   */
  async createTransfer(
    params: PartialBy<TransferParams, 'clientId' | 'signature'>,
    positionId: string,
  ): Promise<{ transfer: TransferResponseObject }> {
    const clientId = params.clientId || generateRandomClientId();

    let signature: string | undefined = params.signature;
    if (!signature) {
      if (!this.starkKeyPair) {
        throw new Error(
          'Transfer is not signed and client was not initialized with starkPrivateKey',
        );
      }
      const transferToSign: StarklibTransferParams = {
        humanAmount: params.amount,
        expirationIsoTimestamp: params.expiration,
        receiverPositionId: params.receiverPositionId,
        senderPositionId: positionId,
        receiverPublicKey: params.receiverPublicKey,
        clientId,
      };
      const starkTransfer = SignableTransfer.fromTransfer(transferToSign, this.networkId);
      signature = await starkTransfer.sign(this.starkKeyPair);
    }

    const transfer: ApiTransfer = {
      amount: params.amount,
      receiverAccountId: params.receiverAccountId,
      clientId,
      signature,
      expiration: params.expiration,
    };

    return this.post(
      'transfers',
      transfer,
    );
  }

  /**
   * @description get a user's funding payments by a set of query parameters
   *
   * @params {
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
    genericParams: GenericParams = {},
  ): Promise<{ fundingPayments: FundingResponseObject[] }> {
    return this._get(
      'funding',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get historical pnl ticks for an account between certain times
   *
   * @params {
   * @createdBeforeOrAt latest historical pnl tick being returned
   * @createdOnOrAfter earliest historical pnl tick being returned
   * }
   */
  getHistoricalPnl(
    params: {
      createdBeforeOrAt?: ISO8601,
      createdOnOrAfter?: ISO8601,
    },
    genericParams: GenericParams = {},
  ): Promise<{ historicalPnl: HistoricalPnlResponseObject[] }> {
    return this._get(
      'historical-pnl',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get trading rewards for a user for a given epoch
   *
   * @params {
   * @epoch to request rewards data for (optional)
   * }
   */
  getTradingRewards(
    params: {
      epoch?: number,
      secondaryAddress?: string,
    },
    genericParams: GenericParams = {},
  ): Promise<TradingRewardsResponseObject> {
    return this._get(
      'rewards/weight',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get liquidity provider rewards for a user for a given epoch. use for epochs 13+.
   *
   * @params {
   *   @epoch to request rewards data for (optional)
   * }
   *
   */
  getLiquidityProviderRewardsV2(
    params: {
      epoch?: number,
    },
    genericParams: GenericParams = {},
  ): Promise<LiquidityProviderRewardsV2ResponseObject> {
    return this._get(
      'rewards/liquidity-provider',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description (deprecated) get liquidity provider rewards for a user for a given epoch. use for
   * epochs 0-12.
   *
   * @params {
   *   @epoch to request rewards data for (optional)
   * }
   *
   */
  getLiquidityProviderRewards(
    params: {
      epoch?: number,
      secondaryAddress?: string,
    },
    genericParams: GenericParams = {},
  ): Promise<LiquidityProviderRewardsResponseObject> {
    return this._get(
      'rewards/liquidity',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get retroactive mining rewards for a user for a given epoch
   *
   */
  getRetroactiveMiningRewards(
    genericParams: GenericParams = {},
  ): Promise<RetroactiveMiningRewardsResponseObject> {
    return this._get(
      'rewards/retroactive-mining',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description get the key ids associated with an ethereumAddress
   *
   */
  async getApiKeys(
    genericParams: GenericParams = {},
  ): Promise<{ apiKeys: { key: string }[] }> {
    return this._get('api-keys', { ...genericParams });
  }

  /**
   * @description send verification email to email specified by User
   */
  async sendVerificationEmail(): Promise<{}> {
    return this.put(
      'emails/send-verification-email',
      {},
    );
  }

  /**
   * @description requests tokens on dYdX's staging server.
   * NOTE: this will not work on Mainnet/Production.
   */
  async requestTestnetTokens(): Promise<{ transfer: TransferResponseObject }> {
    // Goerli
    if (this.networkId !== 5) {
      throw new Error('Network is not Goerli');
    }

    return this.post(
      'testnet/tokens',
      {},
    );
  }

  /**
   * @description get ethereum address restrictions on the dYdX protocol.
   */
  async getRestrictions(
    genericParams: GenericParams = {},
  ): Promise<RestrictionResponseObject> {
    return this._get(
      'restrictions',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description comply to dYdX terms of service after a first offense.
   */
  async postRestrictionsCompliance(
    {
      residenceCountry,
      tradingCountry,
    }: {
      residenceCountry: ISO31661ALPHA2,
      tradingCountry: ISO31661ALPHA2,
    },
    genericParams: GenericParams = {},
  ): Promise<UserComplianceResponseObject> {
    return this.post(
      'restrictions/compliance',
      {
        residenceCountry,
        tradingCountry,
        ...genericParams,
      },
    );
  }

  /**
   * @description get private profile information
   */
  async getProfilePrivate(
    genericParams: GenericParams = {},
  ): Promise<ProfilePrivateResponseObject> {
    return this._get(
      'profile/private',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description get information on active linked users
   */
  async getUserLinks(
    genericParams: GenericParams = {},
  ): Promise<UserLinksResponseObject> {
    return this._get(
      'users/links',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description send a link request action
   */
  async sendLinkRequest(
    params: {
      action: LinkAction,
      address: string,
    },
    genericParams: GenericParams = {},
  ): Promise<{}> {
    return this.post(
      'users/links',
      {
        ...params,
        ...genericParams,
      },
    );
  }

  /**
   * @description get information on pending linked user requests
   */
  async getUserPendingLinkRequests(
    genericParams: GenericParams = {},
  ): Promise<UserLinkRequestsResponseObject> {
    return this._get(
      'users/links/requests',
      {
        ...genericParams,
      },
    );
  }

  /**
   * @description get a token to send to the Sumsub liveness verification widget
   */
  async postLivenessTokens(): Promise<{ token: string }> {
    return this.post('users/liveness/tokens', {});
  }

  // ============ Signing ============

  sign({
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
    const messageString: string = (
      isoTimestamp +
      METHOD_ENUM_MAP[method] +
      requestPath +
      (_.isEmpty(data) ? '' : JSON.stringify(data))
    );

    return crypto.createHmac(
      'sha256',
      Buffer.from(this.apiKeyCredentials.secret, 'base64'),
    ).update(messageString).digest('base64');
  }
}
