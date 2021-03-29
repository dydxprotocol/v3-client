import { generateQueryPath } from '../helpers/request-helpers';
import { axiosRequest } from '../lib/axios';
import {
  FastWithdrawalsResponseObject,
  CandleResolution,
  CandleResponseObject,
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
  HistoricalPnlResponseObject,
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
    market: Market,
    days?: MarketStatisticDay,
  }): Promise<{ markets: MarketStatisticResponseObject }> {
    const uri: string = `stats/${market}`;
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
   * @description get historical pnl ticks for an account between certain times
   *
   * @param account being checked
   * @param createdBeforeOrAt latest historical pnl tick being returned
   * @param createdOnOrAfter earliest historical pnl tick being returned
   */
  getHistoricalPnl({
    accountId,
    createdBeforeOrAt,
    createdOnOrAfter,
  }: {
    accountId: string,
    createdBeforeOrAt?: ISO8601,
    createdOnOrAfter?: ISO8601,
  }): Promise<{ historicalPnl: HistoricalPnlResponseObject[] }> {
    const uri: string = 'historical-pnl';
    return this.get(uri, { accountId, createdBeforeOrAt, createdOnOrAfter });
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
   * @description get api server time as iso and as epoch in seconds with MS
   */
  getTime(): Promise<{ time: { iso: string, epoch: number } }> {
    return this.get('time', {});
  }
}
