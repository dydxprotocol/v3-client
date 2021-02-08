/**
 * Unit tests signing with credentials.
 */

import axios, { AxiosResponse } from 'axios';
import Web3 from 'web3';

import { ApiKeyCredentials, DydxClient, TransferAsset } from '../src';
import { RequestMethod } from '../src/lib/axios';
import { asMock } from './helpers/util';

const apiKeyCredentials: ApiKeyCredentials = {
  key: '3a75f079-4195-3f03-0c65-b15ab2d560ab',
  secret: 'WAZ65pjjidV_r4hG1eFGD_qH9-K3zaB9TvtYaHKj',
  passphrase: '49EY4mAs224l7_mlerc-',
};

describe('Verify signature is as expected', () => {
  it('signs a private request', async () => {
    asMock(axios).mockResolvedValue({} as AxiosResponse);

    const web3 = new Web3();

    const client = new DydxClient('https://example.com', { web3, apiKeyCredentials });
    await client.private.getApiKeys();
    expect(client.private.sign({
      requestPath: '/v3/api-keys?ethereumAddress=0xE5714924C8C5c732F92A439075C8211eB0611aaC',
      method: RequestMethod.GET,
      isoTimestamp: '2021-02-01T19:38:54.508Z',
    })).toEqual('jGElyQttdQDNqlRu5CpCtfVEYcikknzXWsOjKJAcTtI=');
  });

  it.only('create and test fast withdrawal', async () => {
    asMock(axios).mockResolvedValue({} as AxiosResponse);

    const web3 = new Web3();

    const client = new DydxClient('https://api.stage.dydx.exchange',
      {
        web3,
        apiKeyCredentials,
        networkId: 3,
        starkPrivateKey: {
          publicKey: '02efbc6e3b80956669f792578e07bc32a26e14c9b0584f07f1e927e1e18c6bfd',
          publicKeyYCoordinate: '06d30c2206a8522dc3149d310c68126bdbfc9280c76f2cdbd48477eb36f05919',
          privateKey: '0002e9892163a085b9570d19c92c9584328d340c1db528ca2448c4cb62332899',
        },
      });
    const result = await client.private.createFastWithdrawal({
      lpStarkKey: '04a9ecd28a67407c3cff8937f329ca24fd631b1d9ca2b9f2df47c7ebf72bf0b0',
      creditAsset: TransferAsset.USDC,
      creditAmount: '30',
      debitAmount: '30',
      toAddress: '0x77a035b677d5a0900e4848ae885103cd49af9633',
      lpPositionId: '2',
      expiration: '2021-02-18T18:27:55.116Z',
      clientId: '12818201',
    }, '4798');
    console.log(result);
  });
});
