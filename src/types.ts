import {
  Asset,
  OrderSide,
  PerpetualMarket,
} from '@dydxprotocol/starkex-lib';
import BigNumber from 'bignumber.js';
import { HttpProvider, IpcProvider, WebsocketProvider } from 'web3-core';

export { Asset, OrderSide } from '@dydxprotocol/starkex-lib';
export { Account as EthereumAccount } from 'web3-core';

export type ISO8601 = string;

export type Address = string;

export type Integer = BigNumber;

export type Provider = HttpProvider | IpcProvider | WebsocketProvider;

export type PositionsMap = { [market: string]: PositionResponseObject };

// TODO: Find a better way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Data = any;

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
  cancelId?: string;
  triggerPrice?: string;
  trailingPercent?: string;
}

export interface ApiWithdrawal extends ApiStarkwareSigned {
  amount: string,
  asset: Asset,
  toAddress: string,
  clientId: string;
}

// ============ API Response Types ============

export interface ApiKeyResponseObject {
  apiKey: string;
}

export interface MarketResponseObject {
  market: PerpetualMarket;
  status: string;
  baseAsset: Asset;
  quoteAsset: Asset;
  tickSize: string;
  makerFee: string;
  takerFee: string;
  indexPrice: string;
  oraclePrice: string;
  nextFundingRate: string;
  minOrderSize: string;
  type: string;
  initialMarginFraction: string;
  maintenanceMarginFraction: string;
}

export interface MarketStatisticResponseObject {
  market: PerpetualMarket;
  open: string;
  high: string;
  low: string;
  close: string;
  baseVolume: string;
  quoteVolume: string;
  type: string;
  nextFundingRate: ISO8601;
}

export interface OrderResponseObject {
  id: string;
  clientId: string;
  accountId: string;
  market: PerpetualMarket;
  side: OrderSide;
  price: string;
  triggerPrice?: string | null;
  trailingPercent?: string | null;
  size: string;
  remainingSize: string;
  type: OrderType;
  createdAt: ISO8601;
  unfillableAt?: ISO8601 | null;
  expiresAt: ISO8601;
  status: OrderStatus;
  timeInForce: TimeInForce;
  postOnly: boolean;
  cancelReason?: string | null;
}

export interface PositionResponseObject {
  accountId: string;
  market: PerpetualMarket;
  status: PositionStatus;
  side: string;
  size: string;
  maxSize: string;
  entryPrice: string;
  exitPrice?: string;
  unrealizedPnl: string;
  realizedPnl?: string;
  createdAt: ISO8601;
  closedAt?: ISO8601;
}

export interface FillResponseObject {
  id: string;
  accountId: string;
  side: OrderSide;
  liquidity: string;
  market: PerpetualMarket;
  orderId: string;
  price: string;
  size: string;
  fee: string;
  createdAt: ISO8601;
}

export interface UserResponseObject {
  ethereumAddress: string;
  userData: string;
}

export interface AccountResponseObject {
  starkKey: string,
  positionId: string,
  equity: string,
  freeCollateral: string,
  pendingDeposits: string,
  pendingWithdrawals: string,
  openPositions: PositionsMap,
  id: string;
}

export interface TransferResponseObject {
  id: string;
  accountId: string;
  type: string;
  debitAsset: Asset
  creditAsset: Asset;
  debitAmount: string;
  creditAmount: string;
  transactionHash?: string;
  status: string;
  createdAt: ISO8601;
  confirmedAt?: ISO8601;
  clientId?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface FundingResponseObject {
  accountId: string;
  market: PerpetualMarket;
  payment: string;
  rate: string;
  positionSize: string;
  price: string;
  effectiveAt: ISO8601;
}

export interface HistoricalFundingResponseObject {
  market: PerpetualMarket;
  rate: string;
  price: string;
  effectiveAt: ISO8601;
}

export interface OrderbookResponseOrder {
  price: string;
  size: string;
}

export interface Trade {
  side: OrderSide,
  size: string,
  price: string,
  createdAt: ISO8601,
}

// ============ Utility Types ============

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
