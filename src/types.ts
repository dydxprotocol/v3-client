import { Decimal } from '@dydxprotocol/starkex-eth';
import {
  DydxAsset,
  DydxMarket,
  StarkwareOrderSide,
} from '@dydxprotocol/starkex-lib';
import BigNumber from 'bignumber.js';
import { HttpProvider, IpcProvider, WebsocketProvider } from 'web3-core';

export { Account as EthereumAccount } from 'web3-core';

export type ISO6391 = string;

export type ISO8601 = string;

export type ISO31661ALPHA2 = string;

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
  THIRTY_MINS = '30MINS',
  FIFTEEN_MINS = '15MINS',
  FIVE_MINS = '5MINS',
  ONE_MIN = '1MIN',
}

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
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

export enum AccountLeaderboardPnlPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
  COMPETITION = 'COMPETITION',
  CELEBRITY_COMPETITION = 'CELEBRITY_COMPETITION',
  DAILY_COMPETITION = 'DAILY_COMPETITION',
  LEAGUES = 'LEAGUES',
}

export enum LeaderboardPnlPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL_TIME = 'ALL_TIME',
  COMPETITION = 'COMPETITION',
  CELEBRITY_COMPETITION = 'CELEBRITY_COMPETITION',
  DAILY_COMPETITION = 'DAILY_COMPETITION',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export enum LeaderboardPnlSortBy {
  ABSOLUTE = 'ABSOLUTE',
  PERCENT = 'PERCENT',
}

export enum LeaguesExpectedOutcome {
  PROMOTION = 'PROMOTION',
  DEMOTION = 'DEMOTION',
  SAME_LEAGUE = 'SAME_LEAGUE',

  // deprecated.
  RELEGATION = 'RELEGATION',
}

export enum NftRevealType {
  DAY = 'DAY',
  WEEK = 'WEEK',
}

export enum AddressRestrictionType {
  RESTRICTED = 'RESTRICTED',
  RESTRICTED_TRANSFER = 'RESTRICTED_TRANSFER',
  RESTRICTED_WITHDRAWAL = 'RESTRICTED_WITHDRAWAL',
  RESTRICTED_COUNTRY = 'RESTRICTED_COUNTRY',
  FIRST_OFFENSE = 'FIRST_OFFENSE',
  COMPLIED = 'COMPLIED',
}

export enum AffiliateApplicationStatuses {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  REJECTED_AND_BANNED = 'REJECTED_AND_BANNED'
}

export enum LinkType {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
}

export enum LinkAction {
  CREATE_SECONDARY_REQUEST = 'CREATE_SECONDARY_REQUEST',
  DELETE_SECONDARY_REQUEST = 'DELETE_SECONDARY_REQUEST',
  ACCEPT_PRIMARY_REQUEST = 'ACCEPT_PRIMARY_REQUEST',
  REJECT_PRIMARY_REQUEST = 'REJECT_PRIMARY_REQUEST',
  REMOVE = 'REMOVE',
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
  reduceOnly?: boolean;
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
  slippageTolerance?: string;
}

export interface ApiFastWithdrawalParams extends ApiFastWithdrawal {
  lpStarkKey: string;
}

// ============ API Response Types ============

export interface MarketResponseObject {
  market: Market;
  status: MarketStatus;
  baseAsset: Asset;
  quoteAsset: Asset;
  tickSize: string;
  indexPrice: string;
  oraclePrice: string;
  nextFundingRate: string;
  nextFundingAt: ISO8601;
  minOrderSize: string;
  type: string;
  initialMarginFraction: string;
  maintenanceMarginFraction: string;
  stepSize: string;
  priceChange24H: string;
  volume24H: string;
  trades24H: string;
  openInterest: string;
  incrementalInitialMarginFraction: string;
  baselinePositionSize: string;
  incrementalPositionSize: string;
  maxPositionSize: string;
  assetResolution: string;
  syntheticAssetId: string;
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
  fees: string;
}

export interface OrderResponseObject {
  id: string;
  clientId?: string;
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
  expiresAt?: ISO8601;
  status: OrderStatus;
  timeInForce: TimeInForce;
  postOnly: boolean;
  reduceOnly?: boolean;
  cancelReason?: string | null;
}

export interface ActiveOrderResponseObject {
  id: string;
  accountId: string;
  remainingSize: string;
  price: string;
  market: Market;
  side: OrderSide;
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
  sumOpen?: string;
  sumClose?: string;
  netFunding?: string;
}

export interface FillResponseObject {
  id: string;
  side: OrderSide;
  liquidity: string;
  type: OrderType;
  market: Market;
  price: string;
  size: string;
  fee: string;
  createdAt: ISO8601;
  orderId: string | null | undefined;
}

export interface UserResponseObject {
  ethereumAddress: string;
  isRegistered: boolean;
  email: string | null;
  username: string | null;
  userData: {};
  makerFeeRate: string | null;
  takerFeeRate: string | null;
  makerVolume30D: string | null;
  takerVolume30D: string | null;
  fees30D: string | null;
  referredByAffiliateLink: string | null;
  isSharingUsername: boolean | null;
  isSharingAddress: boolean | null;
  dydxTokenBalance: string;
  stakedDydxTokenBalance: string;
  isEmailVerified: boolean;
  country: ISO31661ALPHA2 | null;
  languageCode: ISO6391 | null;
}

export interface AccountResponseObject {
  starkKey: string,
  positionId: string,
  equity: string,
  freeCollateral: string,
  pendingDeposits: string,
  pendingWithdrawals: string,
  openPositions: PositionsMap,
  accountNumber: string,
  id: string;
  quoteBalance: string;
}

export interface TransferResponseObject {
  id: string;
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
  updatedAt: ISO8601;
  market: Market;
  resolution: CandleResolution;
  low: string;
  high: string;
  open: string;
  close: string;
  baseTokenVolume: string;
  trades: string;
  usdVolume: string;
  startingOpenInterest: string;
}

export interface ConfigResponseObject {
  collateralAssetId: string;
  collateralTokenAddress: string;
  defaultMakerFee: string;
  defaultTakerFee: string;
  exchangeAddress: string;
  maxExpectedBatchLengthMinutes: string;
  maxFastWithdrawalAmount: string;
  cancelOrderRateLimiting: CancelOrderRateLimiting;
  placeOrderRateLimiting: PlaceOrderRateLimiting;
}

export interface CancelOrderRateLimiting {
  maxPointsMulti: number;
  maxPointsSingle: number;
  windowSecMulti: number;
  windowSecSingle: number;
}

export interface PlaceOrderRateLimiting {
  maxPoints: number;
  windowSec: number;
  targetNotional: number;
  minLimitConsumption: number;
  minMarketConsumption: number;
  minTriggerableConsumption: number;
  maxOrderConsumption: number;
}

export interface FastWithdrawalsResponseObject {
  liquidityProviders: {
    [lpPositionId: number]: LiquidityProviderInfo;
  };
}

// some fields are leagues specific
export interface LeaderboardPnlResponseObject {
  topPnls: LeaderboardPnl[];
  numParticipants: number;
  startedAt: ISO8601 | null;
  endsAt: ISO8601 | null;
  updatedAt: ISO8601;
  seasonNumber: number | null;
  prizePool: number | null;
  numHedgiesWinners: number | null;
  numPrizeWinners: number | null;
  ratioPromoted: number | null;
  ratioDemoted: number | null;
  minimumEquity: number | null;
  minimumDYDXTokens: number | null;
}

export interface LeaderboardPnl {
  username: string;
  ethereumAddress: string | null;
  publicId: string;
  absolutePnl: string;
  percentPnl: string;
  absoluteRank: number | null;
  percentRank: number | null;
  seasonExpectedOutcome: LeaguesExpectedOutcome | null;
  hedgieWon: number | null;
  prizeWon: string | null;
}

export interface AccountLeaderboardPnlResponseObject {
  absolutePnl: string;
  percentPnl: string;
  absoluteRank: number | null;
  percentRank: number | null;
  updatedAt: ISO8601 | null;
  startedAt: ISO8601 | null;
  endsAt: ISO8601 | null;
  accountId: string;
  period: LeaderboardPnlPeriod;
  seasonExpectedOutcome: LeaguesExpectedOutcome | null;
  seasonNumber: number | null;
  hedgieWon: number | null;
  prizeWon: string | null;
}

export interface HistoricalLeaderboardPnlObject {
  period: LeaderboardPnlPeriod,
  absolutePnl: string,
  percentPnl: string,
  absoluteRank: number | null,
  percentRank: number | null,
  updatedAt: ISO8601,
  startedAt: ISO8601 | null,
  endsAt: ISO8601 | null,
  seasonOutcome: LeaguesExpectedOutcome | null,
  seasonNumber: number | null,
  hedgieWon: number | null,
  prizeWon: string | null,
}

export interface HistoricalLeaderboardPnlsResponseObject {
  leaderboardPnls: HistoricalLeaderboardPnlObject[];
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
  liquidation?: boolean,
}

export interface TradingRewardsResponseObject {
  epoch: number,
  epochStart: ISO8601,
  epochEnd: ISO8601,
  fees: Fees,
  openInterest: OpenInterest,
  weight: Weight,
  stakedDYDX: StakedDYDXIncludingFloor,
  totalRewards: string,
  estimatedRewards: string,
}

export interface Fees {
  feesPaid: string,
  totalFeesPaid: string,
}

export interface OpenInterest {
  averageOpenInterest: string,
  totalAverageOpenInterest: string,
}

export interface Weight {
  weight: string,
  totalWeight: string,
}

export interface StakedDYDX {
  averageStakedDYDX: string,
  totalAverageStakedDYDX: string,
}

export interface StakedDYDXIncludingFloor extends StakedDYDX {
  averageStakedDYDXWithFloor: string,
}

export interface LiquidityProviderRewardsResponseObject {
  epoch: number,
  epochStart: ISO8601,
  epochEnd: ISO8601,
  markets: {
    [market: string]: LiquidityRewards,
  },
  stakedDYDX: StakedDYDX,
}

export interface LiquidityProviderRewardsV2ResponseObject
  extends LiquidityProviderRewardsResponseObject {
  linkedAddressRewards: {
    [address: string]: PerAddressLiquidityRewards,
  }
}

export interface PerAddressLiquidityRewards {
  averageStakedDYDX: string,
  markets: {
    [market: string]: LiquidityRewards,
  },
}

export interface LiquidityRewards {
  market: Market,
  depthSpreadScore: string,
  uptime: string,
  linkedUptime: string,
  maxUptime: string,
  score: string,
  totalScore: string,
  makerVolume: string,
  totalMakerVolume: string,
  estimatedRewards: string,
  totalRewards: string,
  secondaryAllocation: string,
}

export interface RetroactiveMiningRewardsResponseObject {
  epoch: number,
  epochStart: ISO8601,
  epochEnd: ISO8601,
  retroactiveMining: RetroactiveMiningRewards,
  estimatedRewards: string,
}

export interface RetroactiveMiningRewards {
  allocation: string,
  targetVolume: string,
  volume: string,
}

export interface PublicRetroactiveMiningRewardsResponseObject {
  allocation: string,
  targetVolume: string,
}

export interface HedgiePeriodResponseObject {
  blockNumber: number,
  competitionPeriod: number,
  tokenIds: string[],
}

export interface RestrictionResponseObject {
  isRestricted: boolean,
  restrictionType: AddressRestrictionType | null,
  canTrade: boolean,
  canTransfer: boolean,
  canFastWithdraw: boolean,
  canSlowWithdraw: boolean,
  reason: string | null,
}

export interface UserComplianceResponseObject {
  isBanned: boolean,
  reason: string | null,
}

export interface ProfilePublicResponseObject {
  username: string | null,
  ethereumAddress: string | null,
  DYDXHoldings: string | null,
  stakedDYDXHoldings: string | null,
  hedgiesHeld: number[],
  twitterHandle: string | null,
  tradingLeagues: {
    currentLeague: string | null,
    currentLeagueRanking: number | null,
  },
  tradingPnls: {
    absolutePnl30D: string | null,
    percentPnl30D: string | null,
    volume30D: string,
  },
}

export interface ProfilePrivateResponseObject extends ProfilePublicResponseObject {
  publicId: string,
  affiliateApplicationStatus: AffiliateApplicationStatuses,
  affiliateLinks: AffiliateLinkData[],
  tradingRewards: {
    curEpoch: number,
    curEpochEstimatedRewards: Decimal,
    prevEpochEstimatedRewards: Decimal,
  },
  affiliateStatistics: {
    currentEpoch: {
      usersReferred: string,
      revenue: string,
      revenueShareRate: string,
    },
    previousEpochs: {
      usersReferred: string,
      revenue: string,
    },
    lastEpochPaid: string,
  },
}

export interface AffiliateLinkData {
  link: string,
  discountRate: string,
}

export interface UserLinksResponseObject {
  userType: LinkType | null,
  primaryAddress: string | null,
  linkedAddresses: string[] | null,
}

export interface UserLinkRequestsResponseObject {
  userType: LinkType | null,
  outgoingRequests: LinkRequest[] | null,
  incomingRequests: LinkRequest[] | null,
}

export interface LinkRequest {
  primaryAddress: string,
  secondaryAddress: string,
}

// ============ API Response Field Types ============

enum MarketStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  POST_ONLY = 'POST_ONLY',
  CANCEL_ONLY = 'CANCEL_ONLY',
  INITIALIZING = 'INITIALIZING',
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

export interface EthPrivateAction {
  method: string,
  requestPath: string,
  body: string,
  timestamp: string,
}

// ============ Utility Types ============

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
