import { ApiMethod } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import { SignEthPrivateAction } from '../../src/eth-signing';
import { SigningMethod } from '../../src/types';

// DEFAULT GANACHE ACCOUNT FOR TESTING ONLY -- DO NOT USE IN PRODUCTION.
const GANACHE_ADDRESS = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const GANACHE_PRIVATE_KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

// Note that this is the signature for SigningMethod.TypedData, but not SigningMethod.Hash.
const EXPECTED_SIGNATURE = (
  '0x3ec5317783b313b0acac1f13a23eaaa2fca1f45c2f395081e9bfc20b4cc1acb17e' +
  '3d755764f37bf13fa62565c9cb50475e0a987ab0afa74efde0b3926bb7ab9d1b00'
);

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

let localSigner: SignEthPrivateAction;
let remoteSigner: SignEthPrivateAction;

describe('SignEthPrivateAction', () => {

  describe('with a local Ethereum private key', () => {

    beforeAll(() => {
      const web3 = new Web3();
      localSigner = new SignEthPrivateAction(web3, 1);
      web3.eth.accounts.wallet.add(GANACHE_PRIVATE_KEY);
    });

    it('signs and verifies using SigningMethod.Hash', async () => {
      const signature = await localSigner.sign(
        GANACHE_ADDRESS,
        SigningMethod.Hash,
        mockRequestNoBody,
      );
      expect(localSigner.verify(signature, GANACHE_ADDRESS, mockRequestNoBody)).toBe(true);
    });

    it('signs and verifies using SigningMethod.TypedData', async () => {
      const signature = await localSigner.sign(
        GANACHE_ADDRESS,
        SigningMethod.TypedData,
        mockRequestNoBody,
      );
      expect(localSigner.verify(signature, GANACHE_ADDRESS, mockRequestNoBody)).toBe(true);
      expect(signature).toBe(EXPECTED_SIGNATURE);
    });

    it('rejects an invalid signature', async () => {
      const signature = await localSigner.sign(
        GANACHE_ADDRESS,
        SigningMethod.Hash,
        mockRequestNoBody,
      );

      // Change the last character.
      const lastChar = signature.charAt(signature.length - 1);
      const newLastChar = lastChar === '0' ? '1' : '0';
      const invalidSignature = `${signature.slice(0, signature.length - 1)}${newLastChar}`;

      expect(localSigner.verify(invalidSignature, GANACHE_ADDRESS, mockRequestNoBody)).toBe(false);
    });
  });

  describe('with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      remoteSigner = new SignEthPrivateAction(web3, 1);
    });

    it('signs and verifies using SigningMethod.Hash', async () => {
      const signature = await localSigner.sign(
        GANACHE_ADDRESS,
        SigningMethod.Hash,
        mockRequestNoBody,
      );
      expect(localSigner.verify(signature, GANACHE_ADDRESS, mockRequestNoBody)).toBe(true);
    });

    it('signs and verifies using SigningMethod.TypedData', async () => {
      const signature = await remoteSigner.sign(
        GANACHE_ADDRESS,
        SigningMethod.TypedData,
        mockRequestNoBody,
      );
      expect(remoteSigner.verify(signature, GANACHE_ADDRESS, mockRequestNoBody)).toBe(true);
      expect(signature).toBe(EXPECTED_SIGNATURE);
    });

    it('signs and verifies using SigningMethod.TypedData (with body)', async () => {
      const signature = await remoteSigner.sign(
        GANACHE_ADDRESS,
        SigningMethod.TypedData,
        mockRequestWithBody,
      );
      expect(remoteSigner.verify(signature, GANACHE_ADDRESS, mockRequestWithBody)).toBe(true);
    });
  });
});
