import { ApiMethod } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import { SignApiKeyAction } from '../../src/eth-signing';
import { SigningMethod } from '../../src/types';

const mockRequestNoBody = {
  requestPath: 'v3/test',
  method: ApiMethod.POST,
  body: '{}',
  timestamp: '2021-01-08T10:06:12.500Z',
};
const mockRequestWithBody = {
  ...mockRequestNoBody,
  body: JSON.stringify({ key: 'value', key2: 'value2' }),
};

let localSigner: SignApiKeyAction;
let localAccountAddress: string;
let remoteSigner: SignApiKeyAction;
let remoteAccountAddress: string;

describe('SignApiKeyAction', () => {

  describe('without a web3 provider', () => {

    beforeAll(() => {
      const web3 = new Web3();
      localSigner = new SignApiKeyAction(web3, 1);
      localAccountAddress = web3.eth.accounts.wallet.create(1)[0].address;
    });

    it('signs and verifies using SigningMethod.Hash', async () => {
      const signature = await localSigner.sign(
        localAccountAddress,
        SigningMethod.Hash,
        mockRequestNoBody,
      );
      expect(
        localSigner.verify(
          signature,
          localAccountAddress,
          mockRequestNoBody,
        ),
      ).toBe(true);
    });

    it('rejects an invalid signature', async () => {
      const signature = await localSigner.sign(
        localAccountAddress,
        SigningMethod.Hash,
        mockRequestNoBody,
      );

      // Change the last character.
      const lastChar = signature.charAt(signature.length - 1);
      const newLastChar = lastChar === '0' ? '1' : '0';
      const invalidSignature = `${signature.slice(0, signature.length - 1)}${newLastChar}`;

      expect(
        localSigner.verify(
          invalidSignature,
          localAccountAddress,
          mockRequestNoBody,
        ),
      ).toBe(false);
    });
  });

  describe('with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      remoteSigner = new SignApiKeyAction(web3, 1);
      remoteAccountAddress = (await web3.eth.getAccounts())[0];
    });

    it('signs and verifies using SigningMethod.Hash', async () => {
      const signature = await localSigner.sign(
        localAccountAddress,
        SigningMethod.Hash,
        mockRequestNoBody,
      );
      expect(
        localSigner.verify(
          signature,
          localAccountAddress,
          mockRequestNoBody,
        ),
      ).toBe(true);
    });

    it('signs and verifies using SigningMethod.TypedData', async () => {
      const signature = await remoteSigner.sign(
        remoteAccountAddress,
        SigningMethod.TypedData,
        mockRequestNoBody,
      );
      expect(
        remoteSigner.verify(
          signature,
          remoteAccountAddress,
          mockRequestNoBody,
        ),
      ).toBe(true);
    });

    it('signs and verifies using SigningMethod.TypedData (with body)', async () => {
      const signature = await remoteSigner.sign(
        remoteAccountAddress,
        SigningMethod.TypedData,
        mockRequestWithBody,
      );
      expect(
        remoteSigner.verify(
          signature,
          remoteAccountAddress,
          mockRequestWithBody,
        ),
      ).toBe(true);
    });
  });
});
