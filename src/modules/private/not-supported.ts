import Private from './impl';

const handler = {
  get() {
    throw new Error('Private endpoints not supported since apiPrivateKey was not provided');
  },
};

export default new Proxy({}, handler) as Private;
