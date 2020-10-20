import {
  Onboarding,
} from './types';

const handler = {
  get() {
    throw new Error('Onboarding is not supported');
  },
};

export default new Proxy({}, handler) as Onboarding;
