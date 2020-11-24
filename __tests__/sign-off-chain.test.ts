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
    const signature = await signOffChainAction.signOffChainAction(
      account.address,
      SigningMethod.Hash,
      generateOnboardingAction(),
    );
    expect(
      signOffChainAction.signOffChainActionIsValid(
        signature,
        SigningMethod.Hash,
        generateOnboardingAction(),
      ),
    ).toBe(true);
  });

  it('Succeeds with apikey hash', async () => {
    const expiration = new Date('December 30, 2500 11:20:25');
    const url: string = 'v3/test';
    const method: ApiMethod = ApiMethod.POST;

    const signature = await signOffChainAction.signOffChainAction(
      account.address,
      SigningMethod.Hash,
      generateApiKeyAction({
        requestPath: url,
        method,
      }),
      expiration,
    );
    expect(
      signOffChainAction.signOffChainActionIsValid(
        signature,
        account.address,
        generateApiKeyAction({
          requestPath: url,
          method,
        }),
        expiration,
      ),
    ).toBe(true);
  });

  it('Recognizes expired signatures', async () => {
    const expiration = new Date('December 30, 2017 11:20:25');
    const url: string = 'v3/test';
    const method: ApiMethod = ApiMethod.POST;

    const signature = await signOffChainAction.signOffChainAction(
      account.address,
      SigningMethod.Hash,
      generateApiKeyAction({
        requestPath: url,
        method,
      }),
      expiration,
    );
    expect(
      signOffChainAction.signOffChainActionIsValid(
        signature,
        account.address,
        generateApiKeyAction({
          requestPath: url,
          method,
        }),
        expiration,
      ),
    ).toBe(false);
  });
});
