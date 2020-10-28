import { ApiMethod } from '@dydxprotocol/starkex-lib';
import {
  DydxClient,
  generateApiKeyAction,
  generateOnboardingAction,
  SignOffChainAction,
} from '../src';
import {
  SigningMethod,
  Address,
} from '../src/types';
import { EVM } from './helpers/EVM';
import { DUMMY_ADDRESS, PROVIDER } from './helpers/util';

let signer: Address;
let signOffChainAction: SignOffChainAction;

describe('signOffChainAction', () => {
  beforeAll(async () => {
    signer = DUMMY_ADDRESS;
    const client = new DydxClient('https://example.com', { web3Provider: new EVM(PROVIDER) as any });
    signOffChainAction = client.signOffChainAction!;
  });

  it.skip('Succeeds with onboarding hash', async () => {
    const expiration = new Date('December 30, 2500 11:20:25');
    const signature = await signOffChainAction.signOffChainAction(
      expiration,
      signer,
      SigningMethod.Hash,
      generateOnboardingAction(),
    );
    expect(
      signOffChainAction.signOffChainActionIsValid(
        expiration,
        signature,
        SigningMethod.Hash,
        generateOnboardingAction(),
      ),
    ).toBe(true);
  });

  it.skip('Succeeds with apikey hash', async () => {
    const expiration = new Date('December 30, 2500 11:20:25');
    const url: string = 'v3/test';
    const method: ApiMethod = ApiMethod.POST;

    const signature = await signOffChainAction.signOffChainAction(
      expiration,
      signer,
      SigningMethod.Hash,
      generateApiKeyAction({
        requestPath: url,
        method,
      }),
    );
    expect(
      signOffChainAction.signOffChainActionIsValid(
        expiration,
        signature,
        signer,
        generateApiKeyAction({
          requestPath: url,
          method,
        }),
      ),
    ).toBe(true);
  });

  it('Recognizes an invalid signature', async () => {
    const expiration = new Date('December 30, 2500 11:20:25');
    const signature = `0x${'1b'.repeat(65)}00`;
    expect(
      signOffChainAction.signOffChainActionIsValid(
        expiration,
        signature,
        signer,
        generateOnboardingAction(),
      ),
    ).toBe(false);
  });

  it.skip('Recognizes expired signatures', async () => {
    const expiration = new Date('December 30, 2017 11:20:25');
    const signature = await signOffChainAction.signOffChainAction(
      expiration,
      signer,
      SigningMethod.Hash,
      generateOnboardingAction(),
    );
    expect(
      signOffChainAction.signOffChainActionIsValid(
        expiration,
        signature,
        SigningMethod.Hash,
        generateOnboardingAction(),
      ),
    ).toBe(true);
  });
});
