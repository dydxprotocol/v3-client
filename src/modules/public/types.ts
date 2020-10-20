import {
  ISO8601,
  Market,
  MarketStatisticDay,
} from '../../types';

export interface Public {
  getMarkets(market?: Market): Promise<void>;
  getOrderBook(market: Market): Promise<void>;
  getStats({ market, days }: { market: Market, days?: MarketStatisticDay }): Promise<void>;
  getTrades(
    { market, startingBeforeOrAt }: { market: Market, startingBeforeOrAt?: ISO8601 },
  ): Promise<void>;
  getHistoricalFunding(market: Market): Promise<void>;
}
