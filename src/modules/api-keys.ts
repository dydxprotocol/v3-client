import { ApiMethod } from '@dydxprotocol/starkex-lib';
import _ from 'lodash';
import Web3 from 'web3';

import { SignApiKeyAction } from '../eth-signing';
import { generateQueryPath } from '../helpers/request-helpers';
import {
  axiosRequest,
} from '../lib/axios';
import {
  ApiKeyResponseObject,
  SigningMethod,
  Data,
} from '../types';

export default class ApiKeys {
  readonly host: string;
  readonly signer: SignApiKeyAction;

  constructor(
    host: string,
    web3: Web3,
    networkId: number,
  ) {
    this.host = host;
    this.signer = new SignApiKeyAction(web3, networkId);
  }

  // ============ Request Helpers ============

  protected async request(
    method: ApiMethod,
    endpoint: string,
    ethereumAddress: string,
    signingMethod: SigningMethod,
    data: {} = {},
  ): Promise<Data> {
    const requestPath = `/v3/${endpoint}`;
    const timestamp = new Date().toISOString();
    const body = JSON.stringify(data);
    const signature: string = await this.signer.sign(
      ethereumAddress,
      signingMethod,
      {
        method,
        requestPath,
        body,
        timestamp,
      },
    );
    return axiosRequest({
      url: `${this.host}${requestPath}`,
      method,
      data: !_.isEmpty(data) ? body : undefined,
      headers: {
        'DYDX-SIGNATURE': signature,
        'DYDX-TIMESTAMP': timestamp,
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

  /**
   * @description get the apiKeys associated with an ethereumAddress
   *
   * @param ethereumAddress the apiKeys are for
   * @param signingMethod used for the signature that validates the request
   */
  async getApiKeys(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<{ apiKeys: ApiKeyResponseObject[] }> {
    return this.get('api-keys', ethereumAddress, signingMethod);
  }

  /**
   *@description register an apiKey for an ethereumAddress
   *
   * @param apiKey to be registered for an ethereumAddress
   * @param ethereumAddress the apiKey is for
   * @param signingMethod used to validate the request
   */
  async registerApiKey(
    apiKey: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<{ apiKey: ApiKeyResponseObject }> {
    return this.post('api-keys', ethereumAddress, signingMethod, { apiKey });
  }

  /**
   *
   * @param apiKey to be deleted
   * @param ethereumAddress the apiKey is for
   * @param signingMethod used to validate the request
   */
  async deleteApiKey(
    apiKey: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<void> {
    return this.delete('api-keys', ethereumAddress, signingMethod, { apiKey });
  }
}
