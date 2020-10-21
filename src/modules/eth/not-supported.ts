import Eth from './impl';

const handler = {
  get() {
    throw new Error('Eth is not supported');
  },
};

export default new Proxy({}, handler) as Eth;
