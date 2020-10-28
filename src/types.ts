import {
  Asset,
  OrderSide,
  PerpetualMarket,
} from '@dydxprotocol/starkex-lib';
import BigNumber from 'bignumber.js';
import { IpcProvider } from 'ethers/providers';
import { HttpProvider, WebsocketProvider } from 'web3/providers';

export { Asset, OrderSide } from '@dydxprotocol/starkex-lib';

export type ISO8601 = string;

export type Address = string;

export type Integer = BigNumber;

export type Provider = HttpProvider | IpcProvider | WebsocketProvider;

// ============ Enums ============

export type Market = PerpetualMarket;
export const Market = PerpetualMarket;

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

export enum PositionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LIQUIDATED = 'LIQUIDATED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CANCELED = 'CANCELED',
  UNTRIGGERED = 'UNTRIGGERED',
}

export enum AccountAction {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum SigningMethod {
  Compatibility = 'Compatibility',   // picks intelligently between UnsafeHash and Hash
  UnsafeHash = 'UnsafeHash',         // raw hash signed
  Hash = 'Hash',                     // hash prepended according to EIP-191
  TypedData = 'TypedData',           // order hashed according to EIP-712
  MetaMask = 'MetaMask',             // order hashed according to EIP-712 (MetaMask-only)
  MetaMaskLatest = 'MetaMaskLatest', // ... according to latest version of EIP-712 (MetaMask-only)
  CoinbaseWallet = 'CoinbaseWallet', // ... according to latest version of EIP-712 (CoinbaseWallet)
}

export enum SignatureTypes {
  NO_PREPEND = 0,
  DECIMAL = 1,
  HEXADECIMAL = 2,
}

// ============ API Request Types ============

interface ApiStarkwareSigned {
  signature: string;
  expiration: string;
}

export interface ApiOrder extends ApiStarkwareSigned {
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
  amount: string,
  asset: Asset,
  toAddress: string,
  clientId: string;
}

// ============ Utility Types ============

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
