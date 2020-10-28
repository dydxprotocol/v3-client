import Web3 from 'web3';

import { generateQueryPath } from '../../helpers/request-helpers';
import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { ISO8601 } from '../../types';

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
  ): Promise<{}> {
    const url: string = `/v3/${endpoint}`;
    const expiresAt: ISO8601 = new Date().toISOString();
    return axiosRequest({
      url: `${this.host}${url}`,
      method,
      data,
      headers: {
        'DYDX-SIGNATURE': this.signRequest({
          requestPath: url,
          method,
          expiresAt,
          address: ethereumAddress,
          data,
        }),
        'DYDX-TIMESTAMP': expiresAt,
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  protected async get(
    endpoint: string,
    ethereumAddress: string,
  ): Promise<{}> {
    return this.request(RequestMethod.GET, endpoint, ethereumAddress);
  }

  protected async post(
    endpoint: string,
    ethereumAddress: string,
    data: {},
  ): Promise<{}> {
    return this.request(RequestMethod.POST, endpoint, ethereumAddress, data);
  }

  protected async delete(
    endpoint: string,
    ethereumAddress: string,
    params: {},
  ): Promise<{}> {
    return this.request(RequestMethod.DELETE, generateQueryPath(endpoint, params), ethereumAddress);
  }

  // ============ Requests ============

  getApiKeys(
    ethereumAddress: string,
  ): Promise<{}> {
    return this.get('api-keys', ethereumAddress);
  }

  async registerApiKey(
    apiKey: string,
    ethereumAddress: string,
  ): Promise<{}> {
    return this.post('api-keys', ethereumAddress, { apiKey });
  }

  deleteApiKey(
    ethereumAddress: string,
    apiKey: string,
  ): Promise<{}> {
    return this.delete('api-keys', ethereumAddress, { apiKey });
  }

  // ============ Validation Helpers ============

  async signRequest({
    requestPath,
    method,
    expiresAt,
    address,
    data,
  }: {
    requestPath: string,
    method: RequestMethod,
    expiresAt: ISO8601,
    address: string,
    data?: {},
  }): Promise<string> {
    const body: string = data ? JSON.stringify(data) : '';
    const hash: string | null = this.web3.utils.sha3(
      body +
      requestPath +
      method +
      expiresAt,
    ); // TODO EIP 712 compliant

    if (!hash) {
      throw new Error(`Could not generate an api-key request hash for address: ${address}`);
    }

    return this.web3.eth.sign(hash, address);
  }
}
