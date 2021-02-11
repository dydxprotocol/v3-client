import {
  KeyPairWithYCoordinate,
  keyPairFromData,
} from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import { SignOnboardingAction } from '../eth-signing';
import { stripHexPrefix } from '../eth-signing/helpers';
import { keccak256Buffer } from '../helpers/request-helpers';
import {
  RequestMethod,
  axiosRequest,
} from '../lib/axios';
import {
  SigningMethod,
  AccountResponseObject,
  Data,
  UserResponseObject,
  ApiKeyCredentials,
  OnboardingActionString,
} from '../types';

export default class Onboarding {
  readonly host: string;
  readonly signer: SignOnboardingAction;

  constructor(
    host: string,
    web3: Web3,
    networkId: number,
  ) {
    this.host = host;
    this.signer = new SignOnboardingAction(web3, networkId);
  }

  // ============ Request Helpers ============

  protected async post(
    endpoint: string,
    data: {},
    ethereumAddress: string,
    signature: string | null = null,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<Data> {
    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-SIGNATURE': signature || await this.signer.sign(
          ethereumAddress,
          signingMethod,
          { action: OnboardingActionString.ONBOARDING },
        ),
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  // ============ Requests ============

  /**
   * @description create a user, account and apiKey in one onboarding request
   *
   * @param params.starkKey The STARK public key to be associated with the account.
   * @param params.starkKeyYCoordinate Y-coordinate of the key, needed only for account creation.
   * @param params.positionId The position ID to onboard to. Do not use unless an ID was reserved.
   * @param ethereumAddress The Ethereum address to be associated with the user.
   * @param signature Onboarding signature to prove ownership of the Ethereum address.
   * @param signingMethod Signing method to use if the signature was not already provided.
   */
  async createUser(
    params: {
      starkKey: string,
      starkKeyYCoordinate: string,
      positionId?: string,
    },
    ethereumAddress: string,
    signature?: string,
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
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<KeyPairWithYCoordinate> {
    const signature = await this.signer.sign(
      ethereumAddress,
      signingMethod,
      { action: OnboardingActionString.KEY_DERIVATION },
    );
    return keyPairFromData(Buffer.from(stripHexPrefix(signature), 'hex'));
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
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<ApiKeyCredentials> {
    const signature = await this.signer.sign(
      ethereumAddress,
      signingMethod,
      { action: OnboardingActionString.ONBOARDING },
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
