import { ApiMethod } from '@dydxprotocol/starkex-lib';

import { generateQueryPath } from '../helpers/request-helpers';
import {
  axiosRequest,
} from '../lib/axios';
import { generateApiKeyAction } from '../lib/eth-validation/actions';
import {
  ApiKeyResponseObject,
  SigningMethod,
  Data,
} from '../types';
import { SignOffChainAction } from './sign-off-chain-action';

export default class Keys {
  readonly host: string;
  readonly signOffChainAction: SignOffChainAction;

  constructor(
    host: string,
    signOffChainAction: SignOffChainAction,
  ) {
    this.host = host;
    this.signOffChainAction = signOffChainAction;
  }

  // ============ Request Helpers ============

  protected async request(
    method: ApiMethod,
    endpoint: string,
    ethereumAddress: string,
    data?: {},
  ): Promise<Data> {
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
  ): Promise<Data> {
    return this.request(ApiMethod.GET, endpoint, ethereumAddress);
  }

  protected async post(
    endpoint: string,
    ethereumAddress: string,
    data: {},
  ): Promise<Data> {
    return this.request(ApiMethod.POST, endpoint, ethereumAddress, data);
  }

  protected async delete(
    endpoint: string,
    ethereumAddress: string,
    params: {},
  ): Promise<Data> {
    return this.request(ApiMethod.DELETE, generateQueryPath(endpoint, params), ethereumAddress);
  }

  // ============ Requests ============

  async getApiKeys(
    ethereumAddress: string,
  ): Promise<{ apiKeys: ApiKeyResponseObject[] }> {
    return this.get('api-keys', ethereumAddress);
  }

  async registerApiKey(
    apiKey: string,
    ethereumAddress: string,
  ): Promise<{ apiKey: ApiKeyResponseObject }> {
    return this.post('api-keys', ethereumAddress, { apiKey });
  }

  async deleteApiKey(
    apiKey: string,
    ethereumAddress: string,
  ): Promise<void> {
    return this.delete('api-keys', ethereumAddress, { apiKey });
  }
}
