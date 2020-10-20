import {
  Public,
} from './types';

export default class PublicImpl implements Public {
  getMarkets(): void {}
  getOrderBook(): void {}
  getStats(): void {}
  getTrades(): void {}
  getHistoricalFunding(): void {}
}
