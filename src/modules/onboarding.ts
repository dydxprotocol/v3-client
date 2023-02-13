import {
  KeyPairWithYCoordinate,
  keyPairFromData,
} from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import { SignOnboardingAction } from '../eth-signing';
import { getAllSignatureRotations, stripHexPrefix } from '../eth-signing/helpers';
import { keccak256Buffer } from '../helpers/request-helpers';
import {
  RequestMethod,
  axiosRequest,
} from '../lib/axios';
import {
  AccountResponseObject,
  ApiKeyCredentials,
  Data,
  ISO31661ALPHA2,
  OnboardingAction,
  OnboardingActionString,
  SigningMethod,
  UserResponseObject,
} from '../types';

const KEY_DERIVATION_SUPPORTED_SIGNING_METHODS: SigningMethod[] = [
  SigningMethod.TypedData,
  SigningMethod.MetaMask,
  SigningMethod.MetaMaskLatest,
  SigningMethod.CoinbaseWallet,
  SigningMethod.Personal,
];

export default class Onboarding {
  readonly host: string;
  readonly networkId: number;
  readonly signer: SignOnboardingAction;

  constructor(
    host: string,
    web3: Web3,
    networkId: number,
  ) {
    this.host = host;
    this.networkId = networkId;
    this.signer = new SignOnboardingAction(web3, networkId);
  }

  // ============ Request Helpers ============

  protected async post(
    endpoint: string,
    data: {},
    ethereumAddress: string,
    signature: string | null = null,
    signingMethod: SigningMethod = SigningMethod.TypedData,
  ): Promise<Data> {
    const message: OnboardingAction = { action: OnboardingActionString.ONBOARDING };

    // On mainnet, include an extra onlySignOn parameter.
    if (this.networkId === 1) {
      message.onlySignOn = 'https://trade.dydx.exchange';
    }

    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-SIGNATURE': signature || await this.signer.sign(
          ethereumAddress,
          signingMethod,
          message,
        ),
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  /**
   * Sign the 'key derivation' onboarding message to receive a signature.
   *
   * @param ethereumAddress of the account
   * @param signingMethod Method to use for signing
   * @returns Signature used to derive your STARK key pairs
   */
  protected async signStarkKeyDerivationMessage(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.TypedData,
  ): Promise<string> {
    if (!KEY_DERIVATION_SUPPORTED_SIGNING_METHODS.includes(signingMethod)) {
      throw new Error('Unsupported signing method for API key derivation');
    }

    const message: OnboardingAction = {
      action: OnboardingActionString.KEY_DERIVATION,
    };

    // On mainnet, include an extra onlySignOn parameter.
    if (this.networkId === 1) {
      message.onlySignOn = 'https://trade.dydx.exchange';
    }

    return this.signer.sign(ethereumAddress, signingMethod, message);
  }

  // ============ Requests ============

  /**
   * @description create a user, account and apiKey in one onboarding request
   *
   * @param {
   * @starkKey is the unique public key for starkwareLib operations used in the future
   * @starkKeyYCoordinate is the Y Coordinate of the unique public key for starkwareLib
   * operations used in the future
   * }
   * @param ethereumAddress of the account
   * @param signature validating the request
   * @param signingMethod for the request
   * @param referredByAffiliateLink of affiliate who referred the user
   * @param country for the user (ISO 3166-1 Alpha-2 Compliant)
   */
  async createUser(
    params: {
      starkKey: string,
      starkKeyYCoordinate: string,
      referredByAffiliateLink?: string,
      country?: ISO31661ALPHA2,
    },
    ethereumAddress: string,
    signature: string | null = null,
    signingMethod?: SigningMethod,
  ): Promise<{
    apiKey: ApiKeyCredentials,
    user: UserResponseObject,
    account: AccountResponseObject,
  }> {
    return this.post(
      'onboarding',
      params,
      ethereumAddress,
      signature,
      signingMethod,
    );
  }

  // ============ Key Derivation ============

  /**
   * @description Derive a STARK key pair deterministically from an Ethereum key.
   *
   * This is used by the frontend app to derive the STARK key pair in a way that is recoverable.
   * Programmatic traders may optionally derive their STARK key pair in the same way.
   *
   * @param ethereumAddress Ethereum address of the account to use for signing.
   * @param signingMethod Method to use for signing.
   */
  async deriveStarkKey(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.TypedData,
  ): Promise<KeyPairWithYCoordinate> {
    const signature: string = await this.signStarkKeyDerivationMessage(
      ethereumAddress,
      signingMethod,
    );

    return keyPairFromData(Buffer.from(stripHexPrefix(signature), 'hex'));
  }

  /**
   * @description Derive four STARK key pairs deterministically from an Ethereum key, with three
   * of the STARK key pairs using a signature that has had either their 'v' value, 't' value, or
   * both values rotated.
   *
   * This is used by the frontend app to derive the two STARK key pairs to ensure there will be
   * no STARK key mismatch due to a signature's 'v' or 't' value.
   *
   * @param ethereumAddress Ethereum address of the account to use for signing.
   * @param signingMethod Method to use for signing.
   */
  async deriveAllStarkKeys(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.TypedData,
  ): Promise<KeyPairWithYCoordinate[]> {
    const signature: string = await this.signStarkKeyDerivationMessage(
      ethereumAddress,
      signingMethod,
    );

    const rotatedSignatures: string[] = getAllSignatureRotations(signature);

    return rotatedSignatures.map((rotatedSignature: string) => keyPairFromData(
      Buffer.from(stripHexPrefix(rotatedSignature), 'hex'),
    ));
  }

  /**
   * @description Derive an API key pair deterministically from an Ethereum key.
   *
   * This is used by the frontend app to recover the default API key credentials.
   *
   * @param ethereumAddress Ethereum address of the account to use for signing.
   * @param signingMethod Method to use for signing.
   */
  async recoverDefaultApiCredentials(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.TypedData,
  ): Promise<ApiKeyCredentials> {
    if (!KEY_DERIVATION_SUPPORTED_SIGNING_METHODS.includes(signingMethod)) {
      throw new Error('Unsupported signing method for API key derivation');
    }

    const message: OnboardingAction = { action: OnboardingActionString.ONBOARDING };

    // On mainnet, include an extra onlySignOn parameter.
    if (this.networkId === 1) {
      message.onlySignOn = 'https://trade.dydx.exchange';
    }

    const signature = await this.signer.sign(
      ethereumAddress,
      signingMethod,
      message,
    );
    const buffer = Buffer.from(stripHexPrefix(signature), 'hex');

    // Get secret.
    const rBuffer = buffer.slice(0, 32);
    const rHashedData = keccak256Buffer(rBuffer);
    const secret = rHashedData.slice(0, 30);

    // Get key and passphrase.
    const sBuffer = buffer.slice(32, 64);
    const sHashedData = keccak256Buffer(sBuffer);
    const key = sHashedData.slice(0, 16);
    const passphrase = sHashedData.slice(16, 31);

    return {
      secret: toBase64Url(secret),
      key: uuidFormatKey(key),
      passphrase: toBase64Url(passphrase),
    };
  }
}

function uuidFormatKey(keyBuffer: Buffer): string {
  const key: string = keyBuffer.toString('hex');
  return [
    key.slice(0, 8),
    key.slice(8, 12),
    key.slice(12, 16),
    key.slice(16, 20),
    key.slice(20, 32),
  ].join('-');
}

function toBase64Url(base64: Buffer): string {
  return base64.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
