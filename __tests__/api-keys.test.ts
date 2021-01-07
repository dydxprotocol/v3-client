/**
 * Unit tests for the API keys module.
 */

import axios, { AxiosResponse } from 'axios';
import Web3 from 'web3';

import { DydxClient, EthereumAccount } from '../src';
import { asMock } from './helpers/util';

describe('API Keys Module', () => {

  it('Signs a request', async () => {
    asMock(axios).mockResolvedValue({} as AxiosResponse);

    const web3 = new Web3();
    const account: EthereumAccount = web3.eth.accounts.wallet.create(1)[0];
    const client = new DydxClient('https://example.com', { web3 });
    await client.apiKeys.getApiKeys(account.address);

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios).toHaveBeenCalledWith({
      url: expect.stringContaining('/v3/api-keys'),
      method: 'GET',
      headers: {
        'DYDX-SIGNATURE': expect.stringMatching(/0x[0-9a-f]{130}/),
        'DYDX-TIMESTAMP': expect.any(String),
        'DYDX-ETHEREUM-ADDRESS': expect.stringMatching(/0x[0-9a-fA-F]{40}/),
      },
    });
  });
});
