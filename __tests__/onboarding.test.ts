import Web3 from 'web3';

import Onboarding from '../src/modules/onboarding';

// DEFAULT GANACHE ACCOUNT FOR TESTING ONLY -- DO NOT USE IN PRODUCTION.
const GANACHE_ADDRESS = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
const GANACHE_PRIVATE_KEY = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';

const EXPECTED_API_KEY_CREDENTIALS_MAINNET = {
  key: '50fdcaa0-62b8-e827-02e8-a9520d46cb9f',
  secret: 'rdHdKDAOCa0B_Mq-Q9kh8Fz6rK3ocZNOhKB4QsR9',
  passphrase: '12_1LuuJMZUxcj3kGBWc',
};
const EXPECTED_STARK_KEY_PAIR_MAINNET = {
  publicKey: '039d88860b99b1809a63add01f7dfa59676ae006bbcdf38ff30b6a69dcf55ed3',
  publicKeyYCoordinate: '02bdd58a2c2acb241070bc5d55659a85bba65211890a8c47019a33902aba8400',
  privateKey: '0170d807cafe3d8b5758f3f698331d292bf5aeb71f6fd282f0831dee094ee891',
};
const EXPECTED_API_KEY_CREDENTIALS_GOERLI = {
  key: '1871d1ba-537c-7fe8-743c-172bcd4ae5c6',
  secret: 'tQxclqFWip0HL4Q-xkwZb_lTfOQz4GD5CHHpYzWa',
  passphrase: 'B8JFepDVn8eixnor7Imv',
};
const EXPECTED_STARK_KEY_PAIR_GOERLI = {
  publicKey: '03ea05770b452df14427b3f07ff600faa132ecc3d7643275042cb4da6ad99972',
  publicKeyYCoordinate: '07310e2ab01978806a6fb6e51a9ee1c9a5c5117c63530ad7dead2b9f72094cc3',
  privateKey: '01019187d91b8effe153ab1932930e27c8d01c56ad9cc937c777633c0ffc5a7e',
};

let onboardingMainnetRemote: Onboarding;
let onboardingGoerliRemote: Onboarding;
let onboardingMainnetLocal: Onboarding;
let onboardingGoerliLocal: Onboarding;

describe('Onboarding module', () => {

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

  describe('Goerli, with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      onboardingGoerliRemote = new Onboarding('http://example.com', web3, 5);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingGoerliRemote.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_GOERLI);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingGoerliRemote.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_GOERLI);
    });
  });

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

  describe('Goerli, with a local Ethereum private key', () => {

    beforeAll(() => {
      const web3 = new Web3();
      onboardingGoerliLocal = new Onboarding('http://example.com', web3, 5);
      web3.eth.accounts.wallet.add(GANACHE_PRIVATE_KEY);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingGoerliLocal.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_GOERLI);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingGoerliLocal.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_GOERLI);
    });
  });
});
