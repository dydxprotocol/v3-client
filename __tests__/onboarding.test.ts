import Web3 from 'web3';

import Onboarding from '../src/modules/onboarding';

const GANACHE_ADDRESS = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const GANACHE_PRIVATE_KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

const EXPECTED_API_KEY_CREDENTIALS_MAINNET = {
  key: '958080b0-000a-01aa-4012-6bbfebf173ee',
  secret: 'hEIsyT920WaI6LyKBEZCVwhObQk1q7GTIhCD1H2D',
  passphrase: 'Y6uac-42KTvgVy3238GP',
};
const EXPECTED_STARK_KEY_PAIR_MAINNET = {
  publicKey: '05f05b71ca3a07351a7958d9a7eaf2b27e73a150d8f6ff1d8c5f531b54b03ff9',
  publicKeyYCoordinate: '00eb531f998e35daff82beec599e4d035855ba3ab69a9517972fb790cf0e3be1',
  privateKey: '024a8f3cbd1b565a1e9eb4278ab456e88c89f0a901b8c4d00dca82a75f97df95',
};
const EXPECTED_API_KEY_CREDENTIALS_ROPSTEN = {
  key: '75ec2627-35b3-6e53-e5be-a9cfe90afb26',
  secret: 'bzc8HTbdPnMGdZV5dlEkchEzFCihlTPL3Bmk9ucH',
  passphrase: 'XCy5fS635D2mwbnyJwhK',
};
const EXPECTED_STARK_KEY_PAIR_ROPSTEN = {
  publicKey: '062fcdeee03a8752729e5ee70846ba5dd6fa2ac1b5f41348ad08a4755e69af31',
  publicKeyYCoordinate: '007a65cfb3045cfc321edbe4bd0a51f8427b4550be6a90f41eead26bca5fc02b',
  privateKey: '0645d65a6007f87b2e1c6c9aec0ab405cb89ad6d426eb0c312321a55391a46c6',
};

let onboardingMainnetLocal: Onboarding;
let onboardingMainnetRemote: Onboarding;
let onboardingRopstenLocal: Onboarding;
let onboardingRopstenRemote: Onboarding;

describe('Onboarding module', () => {

  describe('mainnet, with a local Ethereum private key', () => {

    beforeAll(() => {
      const web3 = new Web3();
      onboardingMainnetLocal = new Onboarding('http://example.com', web3, 1);
      web3.eth.accounts.wallet.add(GANACHE_PRIVATE_KEY);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingMainnetLocal.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_MAINNET);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingMainnetLocal.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_MAINNET);
    });
  });

  describe('mainnet, with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      onboardingMainnetRemote = new Onboarding('http://example.com', web3, 1);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingMainnetRemote.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_MAINNET);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingMainnetRemote.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_MAINNET);
    });
  });

  describe('Ropsten, with a local Ethereum private key', () => {

    beforeAll(() => {
      const web3 = new Web3();
      onboardingRopstenLocal = new Onboarding('http://example.com', web3, 3);
      web3.eth.accounts.wallet.add(GANACHE_PRIVATE_KEY);
    });

    it.only('derives the default STARK key pair', async () => {
      const keyPair = await onboardingRopstenLocal.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_ROPSTEN);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingRopstenLocal.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_ROPSTEN);
    });
  });

  describe('Ropsten, with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      onboardingRopstenRemote = new Onboarding('http://example.com', web3, 3);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingRopstenRemote.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_ROPSTEN);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingRopstenRemote.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_ROPSTEN);
    });
  });
});
