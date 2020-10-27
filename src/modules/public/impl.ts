import { generateQueryPath } from '../../helpers/request-helpers';
import { axiosRequest } from '../../lib/axios';
import { ISO8601, Market, MarketStatisticDay } from '../../types';

export default class Public {
  readonly host: string;

  constructor(host: string) {
    this.host = host;
  }

  checkIfUserExists(
    ethereumAddress: string,
  ): Promise<{}> {
    const uri: string = 'v3/users/exists';
    return this.sendPublicGetRequest(uri, { ethereumAddress });
  }

  checkIfUsernameExists(
    username: string,
  ): Promise<{}> {
    const uri: string = 'v3/usernames';
    return this.sendPublicGetRequest(uri, { username });
  }

  getMarkets(market?: Market): Promise<{}> {
    const uri: string = 'v3/markets';
    return this.sendPublicGetRequest(uri, { market });
  }

  getOrderBook(market: Market): Promise<{}> {
    return this.sendPublicGetRequest(`v3/orderbook/${market}`, {});
  }

  getStats({
    market,
    days,
  }: {
    market: Market,
    days?: MarketStatisticDay,
  }): Promise<{}> {
    const uri: string = `v3/stats/${market}`;

    return this.sendPublicGetRequest(uri, { days });
  }

  getTrades({
    market,
    startingBeforeOrAt,
  }: {
    market: Market,
    startingBeforeOrAt?: ISO8601,
  }): Promise<{}> {
    const uri: string = `v3/trades/${market}`;

    return this.sendPublicGetRequest(uri, { startingBeforeOrAt });

  }

  getHistoricalFunding(market: Market, effectiveBeforeOrAt: ISO8601): Promise<{}> {
    const uri: string = `v3/historical-funding/${market}`;

    return this.sendPublicGetRequest(uri, { effectiveBeforeOrAt });
  }

  private sendPublicGetRequest(
    requestPath: string,
    params: {},
  ): Promise<{}> {
    return axiosRequest({
      method: 'GET',
      url: `${this.host}/${generateQueryPath(requestPath, params)}`,
    });
  }
}
