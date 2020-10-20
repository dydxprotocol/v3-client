import {
  Eth,
} from './types';

export default class EthImpl implements Eth {
  readonly web3Proivder: {};

  constructor(
    web3Proivder: {},
  ) {
    this.web3Proivder = web3Proivder;
  }
}
