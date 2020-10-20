import {
  Onboarding,
} from './types';

export default class OnboardingImpl implements Onboarding {
  readonly web3Proivder: {};

  constructor(
    web3Proivder: {},
  ) {
    this.web3Proivder = web3Proivder;
  }

  createUser(): void { }
}
