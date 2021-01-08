import Web3 from 'web3';

import { Address, SigningMethod } from '../types';
import { hashString } from './helpers';
import { SignOffChainAction } from './sign-off-chain-action';

const ONBOARDING_STRING: 'dYdX Onboarding' = 'dYdX Onboarding';
const ONBOARDING_MESSAGE = {
  action: ONBOARDING_STRING,
};
const EIP712_ONBOARDING_ACTION_STRUCT = [
  { type: 'string', name: 'action' },
];
const EIP712_ONBOARDING_ACTION_STRUCT_STRING = (
  'dYdX(' +
  'string action' +
  ')'
);

export class SignOnboardingAction extends SignOffChainAction<typeof ONBOARDING_MESSAGE> {

  constructor(
    web3: Web3,
    networkId: number,
  ) {
    super(web3, networkId, EIP712_ONBOARDING_ACTION_STRUCT);
  }

  public getHash(): string {
    const structHash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes32', v: hashString(EIP712_ONBOARDING_ACTION_STRUCT_STRING) },
      { t: 'bytes32', v: hashString(ONBOARDING_STRING) },
    );
    // Non-null assertion operator is safe, hash is null only on empty input.
    return this.getEIP712Hash(structHash!);
  }

  public async sign(
    signer: string,
    signingMethod: SigningMethod,
  ): Promise<string> {
    return super.sign(signer, signingMethod, ONBOARDING_MESSAGE);
  }

  public verify(
    typedSignature: string,
    expectedSigner: Address,
  ): boolean {
    return super.verify(typedSignature, expectedSigner, ONBOARDING_MESSAGE);
  }
}
