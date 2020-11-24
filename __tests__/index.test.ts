import { DydxClient } from '../src';

describe('DydxClient', () => {

  it('creates a client', () => {
    new DydxClient('https://example.com');
  });
});
