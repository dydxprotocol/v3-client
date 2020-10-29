import { ApiMethod } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import { generateQueryPath } from '../../helpers/request-helpers';
import {
  axiosRequest,
} from '../../lib/axios';
import { generateApiKeyAction } from '../../lib/eth-validation/actions';
import { SigningMethod } from '../../types';
import { SignOffChainAction } from '../sign-off-chain-action';

export default class Keys {
  readonly host: string;
  readonly web3: Web3;
  readonly signOffChainAction: SignOffChainAction;

  constructor(
    host: string,
    web3: Web3,
    signOffChainAction: SignOffChainAction,
  ) {
    this.host = host;
    this.web3 = web3;
    this.signOffChainAction = signOffChainAction;
  }

  // ============ Request Helpers ============

  protected async request(
    method: ApiMethod,
    endpoint: string,
    // TODO: Get ethereumAddress from the provider (same address used for signing).
    ethereumAddress: string,
    data?: {},
  ): Promise<{}> {
    const url: string = `/v3/${endpoint}`;
    const expiresAt: Date = new Date();
    const signature: string = await this.signOffChainAction.signOffChainAction(
      ethereumAddress,
      SigningMethod.Hash,
      generateApiKeyAction({
        requestPath: url,
        method,
        data,
      }),
      expiresAt,
    );

    return axiosRequest({
      url: `${this.host}${url}`,
      method,
      data,
      headers: {
        'DYDX-SIGNATURE': signature,
        'DYDX-TIMESTAMP': expiresAt.toISOString(),
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  protected async get(
    endpoint: string,
    ethereumAddress: string,
  ): Promise<{}> {
    return this.request(ApiMethod.GET, endpoint, ethereumAddress);
  }

  protected async post(
    endpoint: string,
    ethereumAddress: string,
    data: {},
  ): Promise<{}> {
    return this.request(ApiMethod.POST, endpoint, ethereumAddress, data);
  }

  protected async delete(
    endpoint: string,
    ethereumAddress: string,
    params: {},
  ): Promise<{}> {
    return this.request(ApiMethod.DELETE, generateQueryPath(endpoint, params), ethereumAddress);
  }

  // ============ Requests ============

  async getApiKeys(
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

  async deleteApiKey(
    ethereumAddress: string,
    apiKey: string,
  ): Promise<{}> {
    return this.delete('api-keys', ethereumAddress, { apiKey });
  }
}
