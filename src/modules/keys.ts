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
    signingMethod: SigningMethod,
    data?: {},
  ): Promise<Data> {
    const requestPath: string = `/v3/${endpoint}`;
    const timestamp: Date = new Date();
    const signature: string = await this.signOffChainAction.signOffChainAction(
      ethereumAddress,
      signingMethod,
      generateApiKeyAction({
        method,
        requestPath,
        data,
      }),
      timestamp,
    );

    return axiosRequest({
      url: `${this.host}${requestPath}`,
      method,
      data,
      headers: {
        'DYDX-SIGNATURE': signature,
        'DYDX-TIMESTAMP': timestamp.toISOString(),
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  protected async get(
    endpoint: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<Data> {
    return this.request(ApiMethod.GET, endpoint, ethereumAddress, signingMethod);
  }

  protected async post(
    endpoint: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
    data: {},
  ): Promise<Data> {
    return this.request(ApiMethod.POST, endpoint, ethereumAddress, signingMethod, data);
  }

  protected async delete(
    endpoint: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
    params: {},
  ): Promise<Data> {
    const requestPath = generateQueryPath(endpoint, params);
    return this.request(ApiMethod.DELETE, requestPath, ethereumAddress, signingMethod);
  }

  // ============ Requests ============

  async getApiKeys(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<{ apiKeys: ApiKeyResponseObject[] }> {
    return this.get('api-keys', ethereumAddress, signingMethod);
  }

  async registerApiKey(
    apiKey: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<{ apiKey: ApiKeyResponseObject }> {
    return this.post('api-keys', ethereumAddress, signingMethod, { apiKey });
  }

  async deleteApiKey(
    apiKey: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<void> {
    return this.delete('api-keys', ethereumAddress, signingMethod, { apiKey });
  }
}
