/**
 * Unit tests for the API keys module.
 */

import axios, { AxiosResponse } from 'axios';
import Web3 from 'web3';

import { ApiKeyCredentials, DydxClient, EthereumAccount } from '../src';
import { asMock } from './helpers/util';

const apiKeyCredentials: ApiKeyCredentials = {
  key: 'd53c3a7d-3add-68db-a9c3-9ad582313c8e',
  secret: '85BR_H-GC7HS3aydOxLw3zjRuDI6RYVgFmsYaKJh',
  passphrase: '1qYatmED3wy9RnDZsGnR',
};

describe('API Keys Module & Private Module', () => {
  it('signs a private request', async () => {
    asMock(axios).mockResolvedValue({} as AxiosResponse);

    const web3 = new Web3();
    const client = new DydxClient('https://example.com', { web3, apiKeyCredentials });
    await client.private.getApiKeys();

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      url: expect.stringContaining('/v3/api-keys'),
      method: 'GET',
      headers: {
        'DYDX-API-KEY': expect.stringMatching(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/),
        'DYDX-TIMESTAMP': expect.any(String),
        'DYDX-PASSPHRASE': expect.stringMatching(/^[A-Za-z0-9_-]{20}$/),
        'DYDX-SIGNATURE': expect.any(String),
      },
      data: undefined,
    });
  });

  it('signs an ApiKey request', async () => {
    asMock(axios).mockResolvedValue({} as AxiosResponse);

    const web3 = new Web3();
    const account: EthereumAccount = web3.eth.accounts.wallet.create(1)[0];
    const client = new DydxClient('https://example.com', { web3 });
    await client.ethPrivate.deleteApiKey(apiKeyCredentials.key, account.address);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      url: expect.stringContaining('/v3/api-keys'),
      method: 'DELETE',
      headers: {
        'DYDX-SIGNATURE': expect.stringMatching(/0x[0-9a-f]{130}/),
        'DYDX-TIMESTAMP': expect.any(String),
        'DYDX-ETHEREUM-ADDRESS': expect.stringMatching(/0x[0-9a-fA-F]{40}/),
      },
    });
  });
});
