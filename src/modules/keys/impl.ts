import Web3 from 'web3';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { Data } from '../../types';

export default class Keys {
  readonly host: string;
  readonly web3: Web3;

  constructor(
    host: string,
    web3: Web3,
  ) {
    this.host = host;
    this.web3 = web3;
  }

  // ============ Request Helpers ============

  protected async request(
    method: RequestMethod,
    endpoint: string,
    // TODO: Get ethereumAddress from the provider (same address used for signing).
    ethereumAddress: string,
    data?: {},
  ): Promise<Data> {
    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method,
      data,
      headers: {
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  protected async get(
    endpoint: string,
    ethereumAddress: string,
  ): Promise<Data> {
    return this.request(RequestMethod.GET, endpoint, ethereumAddress);
  }

  protected async post(
    endpoint: string,
    ethereumAddress: string,
    data: {},
  ): Promise<Data> {
    return this.request(RequestMethod.POST, endpoint, ethereumAddress, data);
  }

  protected async delete(
    endpoint: string,
    ethereumAddress: string,
  ): Promise<Data> {
    return this.request(RequestMethod.DELETE, endpoint, ethereumAddress);
  }

  // ============ Requests ============

  getApiKeys(
    ethereumAddress: string,
  ): Promise<{ apiKeys: string[] }> {
    return this.get('api-keys', ethereumAddress);
  }

  async registerApiKey(
    apiKey: string,
    ethereumAddress: string,
  ): Promise<{ apiKey: string }> {
    return this.post('api-keys', ethereumAddress, { apiKey });
  }

  deleteApiKey(): void {}
}
