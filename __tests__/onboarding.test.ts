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
const EXPECTED_API_KEY_CREDENTIALS_SEPOLIA = {
  key: '30cb6046-8f4a-5677-a19c-a494ccb7c7e5',
  secret: '4Yd_6JtH_-I2taoNQKAhkCifnVHQ2Unue88sIeuc',
  passphrase: 'Db1GQK5KpI_qeddgjF66',
};
const EXPECTED_STARK_KEY_PAIR_SEPOLIA = {
  publicKey: '015e2e074a7ac9e78edb2ee9f11a0c0c0a080c79758ab81616eea9c032c75265',
  publicKeyYCoordinate: '0360408546b64238f80d7a8a336d7304d75f122a7e5bb22cbb7a14f550eac5a8',
  privateKey: '02d21c094fedea3e72bef27fbcdceaafd34e88fc4b7586859e26e98b21e63a60',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_SEPOLIA = {
  privateKey: '06a7689f8d44827c8e86f364c858161dc7d3074cc34e83e032691112dcb964f6',
  publicKey: '044403c08df2abf4f726f4b7f83761097bb1a84ee4cfd4910bf0fd1a59081cf3',
  publicKeyYCoordinate: '006819da149c8fc04391e0a9eb5f0263900a867a5485a093c3f98ec796fe91a4',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_SEPOLIA = {
  privateKey: '00904b77ed3fde9c6a7f2485e4056eb878ebf473ded2380b0174e629dbfa6f13',
  publicKey: '0534e01015261e838b58e855642ccf708f7805be2a820a0daa8c96ad5b23f82c',
  publicKeyYCoordinate: '06d87eb3625f7a9ebdc2172fc477bd793490c18337ea06045de86d0d0001dd5b',
};
const EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_SEPOLIA = {
  privateKey: '03f9afcb719a7e94a1599fb41d241a0c540a78bed04d31b5446b95497fb9d6cc',
  publicKey: '05f39f9f33daa5d36079c7b91e2c34c9eb05a6f73513465a09c3cf74ed8e5008',
  publicKeyYCoordinate: '058f723422fca55bdadc4ae8c3b7ab162a5c154949cdbf0acd612b70ad64b75f',
};

let onboardingMainnetRemote: Onboarding;
let onboardingSepoliaRemote: Onboarding;
let onboardingMainnetLocal: Onboarding;
let onboardingSepoliaLocal: Onboarding;

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

  describe('SEPOLIA, with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      onboardingSepoliaRemote = new Onboarding('http://example.com', web3, 11155111);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingSepoliaRemote.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_SEPOLIA);
    });

    it('derives all possible STARK key pairs', async () => {
      const allKeyPairs = await onboardingSepoliaRemote.deriveAllStarkKeys(GANACHE_ADDRESS);
      expect(allKeyPairs).toStrictEqual([
        EXPECTED_STARK_KEY_PAIR_SEPOLIA,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_SEPOLIA,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_SEPOLIA,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_SEPOLIA,
      ]);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingSepoliaRemote.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_SEPOLIA);
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

  describe('SEPOLIA, with a local Ethereum private key', () => {

    beforeAll(() => {
      const web3 = new Web3();
      onboardingSepoliaLocal = new Onboarding('http://example.com', web3, 11155111);
      web3.eth.accounts.wallet.add(GANACHE_PRIVATE_KEY);
    });

    it('derives the default STARK key pair', async () => {
      const keyPair = await onboardingSepoliaLocal.deriveStarkKey(GANACHE_ADDRESS);
      expect(keyPair).toStrictEqual(EXPECTED_STARK_KEY_PAIR_SEPOLIA);
    });

    it('derives all possible STARK key pairs', async () => {
      const allKeyPairs = await onboardingSepoliaLocal.deriveAllStarkKeys(GANACHE_ADDRESS);

      expect(allKeyPairs).toStrictEqual([
        EXPECTED_STARK_KEY_PAIR_SEPOLIA,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_V_SIG_SEPOLIA,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_T_SIG_SEPOLIA,
        EXPECTED_STARK_KEY_PAIR_FROM_ROTATED_VT_SIG_SEPOLIA,
      ]);
    });

    it('derives the default API key pair', async () => {
      const apiKey = await onboardingSepoliaLocal.recoverDefaultApiCredentials(GANACHE_ADDRESS);
      expect(apiKey).toStrictEqual(EXPECTED_API_KEY_CREDENTIALS_SEPOLIA);
    });
  });
});
