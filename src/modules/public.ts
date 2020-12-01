import { generateQueryPath } from '../helpers/request-helpers';
import { axiosRequest } from '../lib/axios';
import {
  Data,
  HistoricalFundingResponseObject,
  ISO8601,
  Market,
  MarketResponseObject,
  MarketStatisticDay,
  MarketStatisticResponseObject,
  OrderbookResponseOrder,
  Trade,
} from '../types';

export default class Public {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  /**
   * @description check if a user exists for an ethereum address
   *
   * @param ethereumAddress of the user
   */
  checkIfUserExists(
    ethereumAddress: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'v3/users/exists';
    return this.sendPublicGetRequest(uri, { ethereumAddress });
  }

  /**
   * @description check if a username already exists
   *
   * @param username being queried
   */
  checkIfUsernameExists(
    username: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'v3/usernames';
    return this.sendPublicGetRequest(uri, { username });
  }

  /**
   * @description get market information for either all markets or a specific market
   *
   * @param market if only one market should be returned
   */
  getMarkets(market?: Market): Promise<{ markets: MarketResponseObject }> {
    const uri: string = 'v3/markets';
    return this.sendPublicGetRequest(uri, { market });
  }

  /**
   * @description get orderbook for a specific market
   *
   * @param market being queried
   */
  getOrderBook(market: Market): Promise<{
    orderbook: {
      bids: OrderbookResponseOrder[],
      asks: OrderbookResponseOrder[],
    }
  }> {
    return this.sendPublicGetRequest(`v3/orderbook/${market}`, {});
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
    const uri: string = `v3/stats/${market}`;

    return this.sendPublicGetRequest(uri, { days });
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
    const uri: string = `v3/trades/${market}`;

    return this.sendPublicGetRequest(uri, { startingBeforeOrAt });

  }

  /**
   * @description get historical funding rates for a market up to a certain time
   *
   * @param market being checked
   * @param effectiveBeforeOrAt latest historical funding rate being returned
   */
  getHistoricalFunding(market: Market, effectiveBeforeOrAt: ISO8601):
  Promise<{ historicalFunding: HistoricalFundingResponseObject }> {
    const uri: string = `v3/historical-funding/${market}`;

    return this.sendPublicGetRequest(uri, { effectiveBeforeOrAt });
  }

  private sendPublicGetRequest(
    requestPath: string,
    params: {},
  ): Promise<Data> {
    return axiosRequest({
      method: 'GET',
      url: `${this.host}/${generateQueryPath(requestPath, params)}`,
    });
  }
}
