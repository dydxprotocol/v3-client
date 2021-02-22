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
const EXPECTED_API_KEY_CREDENTIALS_ROPSTEN = {
  key: '9c1d91a5-0a30-1ed4-2d3d-b840a479b965',
  secret: 'hHYEswFe5MHMm8gFb81Jas9b7iLQUicsVv5YBRMY',
  passphrase: '9z5Ew7m2DLQd87Xlk7Hd',
};
const EXPECTED_STARK_KEY_PAIR_ROPSTEN = {
  publicKey: '035e23a936e596969a6b3131cfccbd18b71779f28276d30e8215cd0d3e9252c2',
  publicKeyYCoordinate: '0557d1a1be389d9921b9d16415eac12bd276b05e2564c4b30a7730ace13a0e19',
  privateKey: '050505654b282eb3debadddeddfa1bc76545a6837dcd59d7d41f6a282a4bbccc',
};

let onboardingMainnetRemote: Onboarding;
let onboardingRopstenRemote: Onboarding;
let onboardingMainnetLocal: Onboarding;
let onboardingRopstenLocal: Onboarding;

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

  describe('Ropsten, with a local Ethereum private key', () => {

    beforeAll(() => {
      const web3 = new Web3();
      onboardingRopstenLocal = new Onboarding('http://example.com', web3, 3);
      web3.eth.accounts.wallet.add(GANACHE_PRIVATE_KEY);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingRopstenLocal.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_ROPSTEN);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingRopstenLocal.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_ROPSTEN);
    });
  });
});
