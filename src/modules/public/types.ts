import {
  ISO8601,
  Market,
  MarketStatisticDay,
} from '../../types';

export interface Public {
  readonly host: string;

  getMarkets(market?: Market): Promise<{}> ;
  getOrderBook(market: Market): Promise<{}> ;
  getStats({ market, days }: { market: Market, days?: MarketStatisticDay }): Promise<{}> ;
  getTrades(
    { market, startingBeforeOrAt }: { market: Market, startingBeforeOrAt?: ISO8601 },
  ): Promise<{}> ;
  getHistoricalFunding(market: Market): Promise<{}> ;
}
