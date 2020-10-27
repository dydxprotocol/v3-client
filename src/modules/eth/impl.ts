import Web3 from 'web3';

export default class Eth {
  readonly web3: Web3;

  constructor(
    web3: Web3,
  ) {
    this.web3 = web3;
  }
}
