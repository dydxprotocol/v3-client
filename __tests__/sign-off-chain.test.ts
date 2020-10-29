import { ApiMethod } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';
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
import { DUMMY_ADDRESS } from './helpers/util';

let signer: Address;
let signOffChainAction: SignOffChainAction;

describe('signOffChainAction', () => {
  beforeAll(async () => {
    signer = DUMMY_ADDRESS;
    const web3 = new Web3();

    const client = new DydxClient('https://example.com', { web3 });
    signOffChainAction = client.signOffChainAction!;
  });

  it.only('Succeeds with onboarding hash', async () => {
    const signature = await signOffChainAction.signOffChainAction(
      signer,
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
      signer,
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
        signer,
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
      signer,
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
        signer,
        generateApiKeyAction({
          requestPath: url,
          method,
        }),
        expiration,
      ),
    ).toBe(true);
  });
});
