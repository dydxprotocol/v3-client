import { axiosRequest } from '../../lib/axios';
import { ISO8601, Market, MarketStatisticDay } from '../../types';

export default class Public {
  host: string;

  constructor(host: string) {
    this.host = host;
  }

  getAccount(
    accountId: string,
    ethereumAddress: string, // TODO: Should not require this.
  ): Promise<{}> {
    const uri: string = `v3/accounts/${accountId}`;
    return this.sendPublicGetRequest(
      uri,
      {
        owner: ethereumAddress,
      },
    );
  }

  getMarkets(market?: Market): Promise<{}> {
    let uri: string = 'v3/markets';

    if (market) {
      uri = uri.concat(`?market=${market}`);
    }

    return this.sendPublicGetRequest(uri);
  }

  getOrderBook(market: Market): Promise<{}> {
    return this.sendPublicGetRequest(`v3/orderbook/${market}`);
  }

  getStats({
    market,
    days,
  }: {
    market: Market,
    days?: MarketStatisticDay,
  }): Promise<{}> {
    let uri: string = `v3/stats/${market}`;

    if (days) {
      uri = uri.concat(`?days=${days}`);
    }

    return this.sendPublicGetRequest(uri);
  }

  getTrades({
    market,
    startingBeforeOrAt,
  }: {
    market: Market,
    startingBeforeOrAt?: ISO8601,
  }): Promise<{}> {
    let uri: string = `v3/stats/${market}`;

    if (startingBeforeOrAt) {
      uri = uri.concat(`?startingBeforeOrAt=${startingBeforeOrAt}`);
    }

    return this.sendPublicGetRequest(uri);
  }

  getHistoricalFunding(market: Market): Promise<{}> {
    return this.sendPublicGetRequest(`v3/historical-funding/${market}`);
  }

  private sendPublicGetRequest(
    requestPath: string,
    headers: {} = {},
  ): Promise<{}> {
    return axiosRequest({
      method: 'GET',
      headers,
      url: `${this.host}/${requestPath}`,
    });
  }
}
