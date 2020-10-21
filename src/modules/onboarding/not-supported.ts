import Onboarding from './impl';

const handler = {
  get() {
    throw new Error('Onboarding is not supported');
  },
};

export default new Proxy({}, handler) as Onboarding;
