import {
  DydxAsset,
  DydxMarket,
  StarkwareOrderSide,
} from '@dydxprotocol/starkex-lib';
import BigNumber from 'bignumber.js';
import { HttpProvider, IpcProvider, WebsocketProvider } from 'web3-core';

export { Account as EthereumAccount } from 'web3-core';

export type ISO8601 = string;

export type Address = string;

export type Integer = BigNumber;

export type Provider = HttpProvider | IpcProvider | WebsocketProvider;

export type PositionsMap = { [market: string]: PositionResponseObject };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericParams = { [name: string]: any };

// TODO: Find a better way.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Data = any;

export { SendOptions as EthereumSendOptions } from '@dydxprotocol/starkex-eth';

// ============ Credentials ============

export interface ApiKeyCredentials {
  key: string,
  secret: string,
  passphrase: string,
}

// ============ Enums ============

export type Market = DydxMarket;
export const Market = DydxMarket;
export type Asset = DydxAsset;
export const Asset = DydxAsset;
export type OrderSide = StarkwareOrderSide;
export const OrderSide = StarkwareOrderSide;

export enum TransferAsset {
  USDC = 'USDC',
}

export enum MarketStatisticDay {
  ONE = '1',
  SEVEN = '7',
  THIRTY = '30',
}

export enum CandleResolution {
  ONE_DAY = '1DAY',
  FOUR_HOURS = '4HOURS',
  ONE_HOUR = '1HOUR',
  FIVE_MINS = '5MINS',
  ONE_MIN = '1MIN',
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
  Personal = 'Personal',             // message signed with personal_sign
}

export enum SignatureTypes {
  NO_PREPEND = 0,
  DECIMAL = 1,
  HEXADECIMAL = 2,
  PERSONAL = 3,
}

export enum LeaderboardPnlPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
}

export enum LeaderboardPnlSortBy {
  ABSOLUTE = 'ABSOLUTE',
  PERCENT = 'PERCENT',
}

// ============ API Request Types ============

interface ApiStarkwareSigned {
  signature: string;
  expiration: string;
}

export interface ApiOrder extends ApiStarkwareSigned {
  market: Market;
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
  amount: string;
  asset: Asset;
  clientId: string;
}

export interface ApiTransfer extends ApiStarkwareSigned {
  amount: string;
  clientId: string;
  receiverAccountId: string;
}

export interface TransferParams extends ApiStarkwareSigned {
  amount: string;
  clientId: string;
  receiverAccountId: string;
  receiverPublicKey: string;
  receiverPositionId: string;
}

export interface ApiFastWithdrawal extends ApiStarkwareSigned {
  creditAsset: TransferAsset;
  creditAmount: string;
  debitAmount: string;
  toAddress: string;
  lpPositionId: string;
  clientId: string;
}

export interface ApiFastWithdrawalParams extends ApiFastWithdrawal {
  lpStarkKey: string;
}

// ============ API Response Types ============

export interface MarketResponseObject {
  market: Market;
  status: string;
  baseAsset: Asset;
  quoteAsset: Asset;
  stepSize: string;
  tickSize: string;
  indexPrice: string;
  oraclePrice: string;
  nextFundingRate: string;
  minOrderSize: string;
  type: string;
  initialMarginFraction: string;
  maintenanceMarginFraction: string;
  priceChange24H: string;
  volume24H: string;
  trades24H: string;
  openInterest: string;
  maxPositionSize: string;
  incrementalInitialMarginFraction: string;
  incrementalPositionSize: string;
  basePositionSize: string;
}

export interface MarketsResponseObject {
  [market: string]: MarketResponseObject;
}

export interface MarketStatisticResponseObject {
  market: Market;
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
  market: Market;
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
  market: Market;
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
  market: Market;
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
  market: Market;
  payment: string;
  rate: string;
  positionSize: string;
  price: string;
  effectiveAt: ISO8601;
}

export interface HistoricalFundingResponseObject {
  market: Market;
  rate: string;
  price: string;
  effectiveAt: ISO8601;
}

export interface HistoricalPnlResponseObject {
  equity: string;
  totalPnl: string;
  createdAt: ISO8601;
  netTransfers: string;
  accountId: string;
}

export interface OrderbookResponseOrder {
  price: string;
  size: string;
}

export interface OrderbookResponseObject {
  bids: OrderbookResponseOrder[],
  asks: OrderbookResponseOrder[],
}

export interface CandleResponseObject {
  startedAt: ISO8601;
  market: Market;
  resolution: CandleResolution;
  low: string;
  high: string;
  open: string;
  close: string;
  baseTokenVolume: string;
  trades: string;
  usdVolume: string;
}

export interface ConfigResponseObject {
  maxFastWithdrawalAmount: string;
  defaultMakerFee: string;
  defaultTakerFee: string;
}

export interface FastWithdrawalsResponseObject {
  liquidityProviders: {
    [lpPositionId: number]: LiquidityProviderInfo;
  };
}

export interface LeaderboardPnlResponseObject {
  topPnls: LeaderboardPnl[];
  updatedAt: ISO8601;
}

export interface LeaderboardPnl {
  username: string;
  ethereumAddress: string | null;
  absolutePnl: string;
  percentPnl: string;
  absoluteRank: number | null;
  percentRank: number | null;
}

export interface AccountLeaderboardPnlResponseObject {
  absolutePnl: string;
  percentPnl: string;
  absoluteRank: number | null;
  percentRank: number | null;
  updatedAt: ISO8601,
  accountId: string;
}

export interface LiquidityProviderInfo {
  availableFunds: string;
  starkKey: string;
  quote: LiquidityProviderQuote | null;
}

export interface LiquidityProviderQuote {
  creditAsset: TransferAsset;
  creditAmount: string;
  debitAmount: string;
}

export interface Trade {
  side: OrderSide,
  size: string,
  price: string,
  createdAt: ISO8601,
}

// ============ Ethereum Signing ============

export enum OnboardingActionString {
  ONBOARDING = 'dYdX Onboarding',
  KEY_DERIVATION = 'dYdX STARK Key',
}

export interface OnboardingAction {
  action: OnboardingActionString;
  onlySignOn?: 'https://trade.dydx.exchange';
}

export interface ApiKeyAction {
  method: string,
  requestPath: string,
  body: string,
  timestamp: string,
}

// ============ Utility Types ============

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
