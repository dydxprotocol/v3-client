/**
 * Signatures on static messages for onboarding.
 *
 * These are used during onboarding. The signature must be deterministic based on the Ethereum key
 * because the signatures will be used for key derivation, and the keys should be recoverable:
 *   - The onboarding signature is used to derive the default API credentials, on the server.
 *   - The key derivation signature is used by the frontend app to derive the STARK key pair.
 *     Programmatic traders may optionally derive their STARK key pair in the same way.
 */

import Web3 from 'web3';

import { OnboardingAction } from '../types';
import { hashString } from './helpers';
import { SignOffChainAction } from './sign-off-chain-action';

const EIP712_ONBOARDING_ACTION_STRUCT = [
  { type: 'string', name: 'action' },
];
const EIP712_ONBOARDING_ACTION_STRUCT_STRING = (
  'dYdX(' +
  'string action' +
  ')'
);

export class SignOnboardingAction extends SignOffChainAction<OnboardingAction> {

  constructor(
    web3: Web3,
    networkId: number,
  ) {
    super(web3, networkId, EIP712_ONBOARDING_ACTION_STRUCT);
  }

  public getHash(
    message: OnboardingAction,
  ): string {
    const structHash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes32', v: hashString(EIP712_ONBOARDING_ACTION_STRUCT_STRING) },
      { t: 'bytes32', v: hashString(message.action) },
    );
    // Non-null assertion operator is safe, hash is null only on empty input.
    return this.getEIP712Hash(structHash!);
  }
}
