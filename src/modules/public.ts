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

  checkIfUserExists(
    ethereumAddress: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'v3/users/exists';
    return this.sendPublicGetRequest(uri, { ethereumAddress });
  }

  checkIfUsernameExists(
    username: string,
  ): Promise<{ exists: boolean }> {
    const uri: string = 'v3/usernames';
    return this.sendPublicGetRequest(uri, { username });
  }

  getMarkets(market?: Market): Promise<{ markets: MarketResponseObject }> {
    const uri: string = 'v3/markets';
    return this.sendPublicGetRequest(uri, { market });
  }

  getOrderBook(market: Market): Promise<{
    orderbook: {
      bids: OrderbookResponseOrder[],
      asks: OrderbookResponseOrder[],
    }
  }> {
    return this.sendPublicGetRequest(`v3/orderbook/${market}`, {});
  }

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
