import Web3 from 'web3';

import Onboarding from '../src/modules/onboarding';

let onboardingWithLocalKey: Onboarding;
let localEthereumAddress: string;

let onboardingWithRemoteKey: Onboarding;
let remoteEthereumAddress: string;

describe('Onboarding module', () => {

  describe('without a web3 provider', () => {

    beforeAll(() => {
      const web3 = new Web3();
      onboardingWithLocalKey = new Onboarding('http://example.com', web3, 1001);
      localEthereumAddress = web3.eth.accounts.wallet.create(1)[0].address;
    });

    it('derives a STARK key pair', async () => {
      const keyPair = await onboardingWithLocalKey.deriveStarkKey(localEthereumAddress);
      expect(keyPair).toStrictEqual({
        publicKey: expect.stringMatching(/^[0-9a-f]{64}$/),
        publicKeyYCoordinate: expect.stringMatching(/^[0-9a-f]{64}$/),
        privateKey: expect.stringMatching(/^[0-9a-f]{64}$/),
      });
    });
  });

  describe('with a web3 provider', () => {

    beforeAll(async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
      onboardingWithRemoteKey = new Onboarding('http://example.com', web3, 1001);
      remoteEthereumAddress = (await web3.eth.getAccounts())[0];
    });

    it('derives a STARK key pair', async () => {
      const keyPair = await onboardingWithRemoteKey.deriveStarkKey(remoteEthereumAddress);
      expect(keyPair).toStrictEqual({
        publicKey: '07100a584ea28998604e0dc2e68c427cefb86d147fc1de15100f5fa97ec2b0d2',
        publicKeyYCoordinate: '0098701245cd63700e42fbcd8fb16df310f3c038d39f21deb60da50f54a824b7',
        privateKey: '01bb0389af265c56844fa79b1e586b36f535fee293f59768fdb61d3f280f05fb',
      });
    });
  });
});
