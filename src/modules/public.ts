import { generateQueryPath } from '../helpers/request-helpers';
import { axiosRequest } from '../lib/axios';
import {
  FastWithdrawalsResponseObject,
  CandleResolution,
  CandleResponseObject,
  ConfigResponseObject,
  Data,
  HistoricalFundingResponseObject,
  ISO8601,
  Market,
  MarketsResponseObject,
  MarketStatisticDay,
  MarketStatisticResponseObject,
  OrderbookResponseObject,
  Trade,
  TransferAsset,
  LeaderboardPnlSortBy,
  LeaderboardPnlPeriod,
  LeaderboardPnlResponseObject,
  PublicRetroactiveMiningRewardsResponseObject,
  NftRevealType,
  HedgiePeriodResponseObject,
  ProfilePublicResponseObject,
} from '../types';

export default class Public {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  // ============ Request Helpers ============

  private get(
    requestPath: string,
    params: {},
  ): Promise<Data> {
    return axiosRequest({
      method: 'GET',
      url: `${this.host}/v3/${generateQueryPath(requestPath, params)}`,
    });
  }

  protected async put(
    requestPath: string,
    data: {},
  ): Promise<Data> {
    return axiosRequest({
      url: `${this.host}/v3/${requestPath}`,
      method: 'PUT',
      data,
    });
  }

  // ============ Requests ============

  /**
   * @description check if a user exists for an ethereum address
   *
   * @param ethereumAddress of the user
   */
  doesUserExistWithAddress(
    ethereumAddress: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'users/exists';
    return this.get(uri, { ethereumAddress });
  }

  /**
   * @description check if a username already exists
   *
   * @param username being queried
   */
  doesUserExistWithUsername(
    username: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'usernames';
    return this.get(uri, { username });
  }

  /**
   * @description get market information for either all markets or a specific market
   *
   * @param market if only one market should be returned
   */
  getMarkets(market?: Market): Promise<{ markets: MarketsResponseObject }> {
    const uri: string = 'markets';
    return this.get(uri, { market });
  }

  /**
   * @description get orderbook for a specific market
   *
   * @param market being queried
   */
  getOrderBook(market: Market): Promise<OrderbookResponseObject> {
    return this.get(`orderbook/${market}`, {});
  }

  /**
   * @description get one or more market specific statistics for a time period
   *
   * @param {
   * @market being queried
   * @days if a specific time period statistic should be returned
   * }
   */
  getStats({
    market,
    days,
  }: {
    market?: Market,
    days?: MarketStatisticDay,
  }): Promise<{ markets: MarketStatisticResponseObject }> {
    const uri: string = market !== undefined
      ? `stats/${market}`
      : 'stats';
    return this.get(uri, { days });
  }

  /**
   * @description get trades for a market up to a certain time
   *
   * @param market being checked
   * @param startingBeforeOrAt latest trade being returned
   */
  getTrades({
    market,
    startingBeforeOrAt,
  }: {
    market: Market,
    startingBeforeOrAt?: ISO8601,
  }): Promise<{ trades: Trade[] }> {
    const uri: string = `trades/${market}`;
    return this.get(uri, { startingBeforeOrAt });
  }

  /**
   * @description get historical funding rates for a market up to a certain time
   *
   * @param market being checked
   * @param effectiveBeforeOrAt latest historical funding rate being returned
   */
  getHistoricalFunding({
    market,
    effectiveBeforeOrAt,
  }: {
    market: Market,
    effectiveBeforeOrAt?: ISO8601,
  }): Promise<{ historicalFunding: HistoricalFundingResponseObject[] }> {
    const uri: string = `historical-funding/${market}`;
    return this.get(uri, { effectiveBeforeOrAt });
  }

  /**
   * @description Get the amount of funds available for fast withdrawals, denominated in USDC.
   * To request a quote for a fast withdrawal, provide either a creditAmount or debitAmount (but
   * not both), and a creditAsset.
   *
   * @param creditAsset The asset to receive
   * @param creditAmount The amount to receive
   * @param debitAmount The amount of the collateral asset to transfer to the LP on layer-2
   */
  getFastWithdrawals({
    creditAsset,
    creditAmount,
    debitAmount,
  }: {
    creditAsset?: TransferAsset,
    creditAmount?: string,
    debitAmount?: string,
  }): Promise<FastWithdrawalsResponseObject> {
    return this.get('fast-withdrawals', { creditAsset, creditAmount, debitAmount });
  }

  /**
   * @description get candles for a specific market
   *
   * @param market being checked
   * @param resolution Specific candle resolution being returned
   * @param fromISO is starting time candles are from
   * @param toISO is ending time candles go up to
   * @param limit to number of candles returned
   */
  getCandles({
    market,
    resolution,
    fromISO,
    toISO,
    limit,
  }: {
    market: Market,
    resolution?: CandleResolution,
    fromISO?: ISO8601,
    toISO?: ISO8601,
    limit?: number,
  }): Promise<{ candles: CandleResponseObject[] }> {
    const uri: string = `candles/${market}`;
    return this.get(
      uri,
      {
        resolution,
        fromISO,
        toISO,
        limit,
      },
    );
  }

  /**
   * @description get leaderboard pnls
   *
   * @param period Time period being checked
   * @param sortBy Pnl to sort by
   * @param limit Number of leaderboard pnls returned
   */
  getLeaderboardPnls({
    period,
    startingBeforeOrAt,
    sortBy,
    limit,
  }: {
    period: LeaderboardPnlPeriod,
    startingBeforeOrAt?: ISO8601,
    sortBy: LeaderboardPnlSortBy,
    limit?: number,
  }): Promise<LeaderboardPnlResponseObject> {
    const uri: string = 'leaderboard-pnl';
    return this.get(
      uri,
      {
        period,
        startingBeforeOrAt,
        sortBy,
        limit,
      },
    );
  }

  /**
   * @description get retroactive mining rewards for an ethereum address
   *
   * @param ethereumAddress An Ethereum address of a user
   */
  getPublicRetroactiveMiningRewards(
    ethereumAddress: string,
  ): Promise<PublicRetroactiveMiningRewardsResponseObject> {
    const uri: string = 'rewards/public-retroactive-mining';
    return this.get(
      uri,
      {
        ethereumAddress,
      },
    );
  }

  /**
   * @description verify email for user with token
   *
   * @token that verifies user received a verification email to
   * the email they specified
   */
  async verifyEmail(token: string): Promise<{}> {
    return this.put(
      'emails/verify-email',
      {
        token,
      },
    );
  }

  /**
   * @description get currently revealed Hedgies
   */
  getCurrentlyRevealedHedgies(): Promise<{
    daily?: HedgiePeriodResponseObject,
    weekly?: HedgiePeriodResponseObject,
  }> {
    return this.get('hedgies/current', {});
  }

  /**
   * @description get historically revealed Hedgies
   */
  getHistoricallyRevealedHedgies({
    nftRevealType,
    start,
    end,
  }: {
    nftRevealType: NftRevealType,
    start?: number,
    end?: number,
  }): Promise<{
    historicalTokenIds: HedgiePeriodResponseObject[],
  }> {
    return this.get(
      'hedgies/history',
      {
        nftRevealType,
        start,
        end,
      },
    );
  }

  /**
   * @description get api server time as iso and as epoch in seconds with MS
   */
  getTime(): Promise<{ iso: string, epoch: number }> {
    return this.get('time', {});
  }

  /**
   * @description get a rough estimate of the difference (in epoch seconds) between the server time
   * and the system time.
   */
  async getTimestampAdjustment(): Promise<number> {
    const time1: number = Date.now();
    const { epoch } = await this.getTime();
    const time2: number = Date.now();

    const averageEpoch: number = (time1 + time2) / 2 / 1000;
    return epoch - averageEpoch;
  }

  /**
   * @description get balance of the dYdX insurance fund
   */
  async getInsuranceFundBalance(): Promise<{ balance: number }> {
    return this.get('insurance-fund/balance', {});
  }

  /**
   * @description get public profile information
   */
  async getProfilePublic({
    publicId,
  }: {
    publicId: string,
  }): Promise<ProfilePublicResponseObject> {
    return this.get(`profile/${publicId}`, {});
  }

  /**
   * @description get global config variables for the exchange as a whole.
   * This includes (but is not limited to) details on the exchange, including addresses,
   * fees, transfers, and rate limits.
   */
  async getConfig(): Promise<ConfigResponseObject> {
    return this.get('config', {});
  }
}
