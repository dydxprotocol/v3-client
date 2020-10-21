import {
  OrderSide,
  PerpetualMarket,
} from '@dydxprotocol/starkex-lib';

export { OrderSide } from '@dydxprotocol/starkex-lib';

export type ISO8601 = string;

// ============ Enums ============

export type Market = PerpetualMarket;
export const Market = PerpetualMarket;

export enum Asset {
  ETH = 'ETH',
  LINK = 'LINK',
  BTC = 'BTC',
  USDC = 'USDC',
  USDT = 'USDT',
  USD = 'USD',
}

export enum MarketStatisticDay {
  ONE = '1',
  SEVEN = '7',
  THIRTY = '30',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  TRAILING_STOP = 'TRAILING_STOP',
  TAKE_PROFIT = 'TAKE_PROFIT',
}

export enum TimeInForce {
  GTT = 'GTT',
  FOK = 'FOK',
  IOC = 'IOC',
}

// ============ API Request Types ============

interface ApiStarkwareSigned {
  signature: string;
  expiration: string;
}

export interface ApiOrder extends ApiStarkwareSigned {
  accountId: string;
  market: PerpetualMarket;
  side: OrderSide;
  type: OrderType;
  size: string;
  price: string;
  clientId: string;
  timeInForce: TimeInForce;
  postOnly: boolean;
  limitFee: string;
}

export interface ApiWithdrawal extends ApiStarkwareSigned {
  amount: Asset,
  asset: Asset,
  toAddress: string,
  clientId: string;
  positionId: string;
  debitAmount: string;
}

// ============ Utility Types ============

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
