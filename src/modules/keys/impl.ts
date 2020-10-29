import Web3 from 'web3';

import { generateQueryPath } from '../../helpers/request-helpers';
import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import {
  Data,
  EthereumAccount,
  ISO8601,
} from '../../types';

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
    const expiresAt: ISO8601 = new Date().toISOString();
    return axiosRequest({
      url: `${this.host}${url}`,
      method,
      data,
      headers: {
        // TODO: Include signature after we get it working.
        // 'DYDX-SIGNATURE': await this.signRequest({
        //   requestPath: url,
        //   method,
        //   expiresAt,
        //   address: ethereumAddress,
        //   data,
        // }),
        'DYDX-TIMESTAMP': expiresAt,
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
    params: {},
  ): Promise<Data> {
    return this.request(RequestMethod.DELETE, generateQueryPath(endpoint, params), ethereumAddress);
  }

  // ============ Requests ============

  async getApiKeys(
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

  async deleteApiKey(
    ethereumAddress: string,
    apiKey: string,
  ): Promise<void> {
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

    // If the address is in the wallet, use it to sign so we don't have to use the web3 provider.
    const walletAccount: EthereumAccount | undefined = (
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (this.web3.eth.accounts.wallet as any)[address] // TODO: Fix types.
    );
    if (walletAccount) {
      return walletAccount.sign(hash).signature;
    }
    return this.web3.eth.sign(hash, address);
  }
}
