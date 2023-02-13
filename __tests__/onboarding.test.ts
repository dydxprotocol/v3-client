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
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_MAINNET = {
  privateKey: '01a8a594a38fe22a533d43a427481d018596bb3ff4eef77001d4651bd4354a97',
  publicKey: '03676c30c45400611dd290b0c6210e1524ba3ce6cee1fb5a0726c6c4d4a0d9e9',
  publicKeyYCoordinate: '0761bdde4fb0229edf02cc67c7d00cac24ee481b8a222a8d176d3550dc96835e',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_MAINNET = {
  privateKey: '00b2ada65a8f233eef4f778dc1bb2155e7893da8ce58ea3d494fe1cd0a937596',
  publicKey: '04e38aa24246634ce880d876f36a80d3781ebf8220d5f9ce6a65c2e7c99d7790',
  publicKeyYCoordinate: '01a205fdd182ee55867a87dc81e859c7ea2238c4c250c1256d88d9e52f5045f9',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_MAINNET = {
  privateKey: '06822e98032edc6d91b091a29b926c374d74ca8c952e5de9f6e27564b0a1799b',
  publicKey: '078fd43a3ba640a1ff71713e86537ddc08ba25fe9ea37815746f486d790e9115',
  publicKeyYCoordinate: '0005e95993fd25cfcdd2ec5820b07b784ab8a95d608e8f920240f3ca907ff56d',
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
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_GOERLI = {
  privateKey: '052e820782c82a686f59863828095e82b7287c05bbed2b7b35bada66374bca02',
  publicKey: '022cf874307a6352b487d768d1c22f17cdfbcd2044762abae3e2ccab205e7c5f',
  publicKeyYCoordinate: '04aa067c547596d6db587ae892fe0c3743c7eec220ed873c39a879c6c7b7aeb6',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_GOERLI = {
  privateKey: '04e31b91e0808be680168ee5cac6144d4a32e550be387731528ee032fd5d7571',
  publicKey: '06e254645e25d32fc90763b386e99b8fe23927205f31fe61c162a446e862ddae',
  publicKeyYCoordinate: '063f47210857f29c8a52437e5f070cb646118f88181f9991d4ba3d1dffcceda5',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_GOERLI = {
  privateKey: '035289da1da837881b780d00e14312c97c3c695378d4adbb3d76bde98ecdbc96',
  publicKey: '006d181da12e58394e450cd0f577150dc10574a88f2bee37323228d2fd717f66',
  publicKeyYCoordinate: '05d1420b2502f89c23e947a0b54a189b17a24fbb15a98e7792504ca271c919c3',
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

    it('derives all possible STARK key pairs', async () => {
      const allKeyPairs = await onboardingMainnetRemote.deriveAllStarkKeys(GANACHE_ADDRESS);

      expect(allKeyPairs).toStrictEqual([
        EXPECTED_STARK_KEY_PAIR_MAINNET,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_MAINNET,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_MAINNET,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_MAINNET,
      ]);
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

    it('derives all possible STARK key pairs', async () => {
      const allKeyPairs = await onboardingGoerliRemote.deriveAllStarkKeys(GANACHE_ADDRESS);
      expect(allKeyPairs).toStrictEqual([
        EXPECTED_STARK_KEY_PAIR_GOERLI,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_GOERLI,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_GOERLI,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_GOERLI,
      ]);
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

    it('derives all possible STARK key pairs', async () => {
      const allKeyPairs = await onboardingMainnetLocal.deriveAllStarkKeys(GANACHE_ADDRESS);

      expect(allKeyPairs).toStrictEqual([
        EXPECTED_STARK_KEY_PAIR_MAINNET,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_MAINNET,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_MAINNET,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_MAINNET,
      ]);
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

    it('derives all possible STARK key pairs', async () => {
      const allKeyPairs = await onboardingGoerliLocal.deriveAllStarkKeys(GANACHE_ADDRESS);

      expect(allKeyPairs).toStrictEqual([
        EXPECTED_STARK_KEY_PAIR_GOERLI,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_GOERLI,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_GOERLI,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_GOERLI,
      ]);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingGoerliLocal.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_GOERLI);
    });
  });
});
