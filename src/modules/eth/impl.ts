import Web3 from 'web3';

export default class Eth {
  readonly web3Provider: {};

  constructor(
    web3Provider: Web3,
  ) {
    this.web3Provider = web3Provider;
  }
}
