import {
  Keys,
} from './types';

const handler = {
  get() {
    throw new Error('Keys is not supported');
  },
};

export default new Proxy({}, handler) as Keys;
