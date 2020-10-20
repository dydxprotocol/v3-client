import {
  Private,
} from './types';

const handler = {
  get() {
    throw new Error('Private is not supported');
  },
};

export default new Proxy({}, handler) as Private;
