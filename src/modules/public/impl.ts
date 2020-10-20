import request from 'request-promise-native';

import { ISO8601, Market, MarketStatisticDay } from '../../types';
import {
  Public,
} from './types';

export default class PublicImpl implements Public {
  getMarkets(market?: Market): Promise<void> {
    let uri: string = 'v3/markets';

    if (market) {
      uri = uri.concat(`?market=${market}`);
    }

    return sendPublicGetRequest(uri);
  }

  getOrderBook(market: Market): Promise<void> {
    return sendPublicGetRequest(`v3/orderbook/${market}`);
  }

  getStats({
    market,
    days,
  }: {
    market: Market,
    days?: MarketStatisticDay,
  }): Promise<void> {
    let uri: string = `v3/stats/${market}`;

    if (days) {
      uri = uri.concat(`?days=${days}`);
    }

    return sendPublicGetRequest(uri);
  }

  getTrades({
    market,
    startingBeforeOrAt,
  }: {
    market: Market,
    startingBeforeOrAt?: ISO8601,
  }): Promise<void> {
    let uri: string = `v3/stats/${market}`;

    if (startingBeforeOrAt) {
      uri = uri.concat(`?startingBeforeOrAt=${startingBeforeOrAt}`);
    }

    return sendPublicGetRequest(uri);
  }

  getHistoricalFunding(market: Market): Promise<void> {
    return sendPublicGetRequest(`v3/historical-funding/${market}`);
  }
}

async function sendPublicGetRequest(uri: string): Promise<void> {
  // TODO make production
  await request({
    method: 'GET',
    uri: `https://api.stage.dydx.exchange/${uri}`,
  });
}
