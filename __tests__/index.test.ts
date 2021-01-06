import { DydxClient } from '../src';

describe('DydxClient', () => {

  it('has separate modules', () => {
    const client = new DydxClient('https://example.com');
    expect(client.eth).toBeTruthy();
    expect(client.apiKeys).toBeTruthy();
    expect(client.onboarding).toBeTruthy();
    expect(client.private).toBeTruthy();
    expect(client.public).toBeTruthy();
  });
});
