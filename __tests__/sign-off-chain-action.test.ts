import { ApiMethod } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';
import {
  generateApiKeyAction,
  generateOnboardingAction,
  SignOffChainAction,
} from '../src';
import {
  SigningMethod,
  EthereumAccount,
} from '../src/types';

let signOffChainAction: SignOffChainAction;
let account: EthereumAccount;

describe('signOffChainAction', () => {

  beforeAll(async () => {
    const web3 = new Web3();
    signOffChainAction = new SignOffChainAction(web3, 1);
    account = web3.eth.accounts.wallet.create(1)[0];
  });

  it('Succeeds with onboarding hash', async () => {
    const signature = await signOffChainAction.sign(
      account.address,
      SigningMethod.Hash,
      generateOnboardingAction(),
    );
    expect(
      signOffChainAction.verify(
        signature,
        account.address,
        generateOnboardingAction(),
      ),
    ).toBe(true);
  });

  it('Succeeds with apikey hash', async () => {
    const expiration = new Date(Date.now() + 10000); // Add 10 seconds.
    const action = generateApiKeyAction({
      requestPath: 'v3/test',
      method: ApiMethod.POST,
      data: { key: 'value' },
    });

    const signature = await signOffChainAction.sign(
      account.address,
      SigningMethod.Hash,
      action,
      expiration,
    );
    expect(
      signOffChainAction.verify(
        signature,
        account.address,
        action,
        expiration,
      ),
    ).toBe(true);
  });

  it('Fails with an invalid signature', async () => {
    const signature = await signOffChainAction.sign(
      account.address,
      SigningMethod.Hash,
      generateOnboardingAction(),
    );

    // Change the last character.
    const lastChar = signature.charAt(signature.length - 1);
    const newLastChar = lastChar === '0' ? '1' : '0';
    const invalidSignature = `${signature.slice(0, signature.length - 1)}${newLastChar}`;

    expect(
      signOffChainAction.verify(
        invalidSignature,
        account.address,
        generateOnboardingAction(),
      ),
    ).toBe(false);
  });

  it('Returns invalid if a signature is expired', async () => {
    const expiration = new Date(Date.now() - 1);
    const action = generateApiKeyAction({
      requestPath: 'v3/test',
      method: ApiMethod.POST,
      data: { key: 'value' },
    });

    const signature = await signOffChainAction.sign(
      account.address,
      SigningMethod.Hash,
      action,
      expiration,
    );
    expect(
      signOffChainAction.verify(
        signature,
        account.address,
        action,
        expiration,
      ),
    ).toBe(false);
  });
});
