import { ApiMethod } from '@dydxprotocol/starkex-lib';
import _ from 'lodash';
import Web3 from 'web3';

import { SignApiKeyAction } from '../eth-signing';
import { generateQueryPath } from '../helpers/request-helpers';
import {
  axiosRequest,
} from '../lib/axios';
import {
  ApiKeyCredentials,
  Data,
  ISO8601,
  SigningMethod,
} from '../types';
import Clock from './clock';

export default class ApiKeys {
  readonly host: string;
  readonly signer: SignApiKeyAction;
  readonly clock: Clock;

  constructor({
    host,
    web3,
    networkId,
    clock,
  }: {
    host: string,
    web3: Web3,
    networkId: number,
    clock: Clock,
  }) {
    this.host = host;
    this.signer = new SignApiKeyAction(web3, networkId);
    this.clock = clock;
  }

  // ============ Request Helpers ============

  protected async request(
    method: ApiMethod,
    endpoint: string,
    ethereumAddress: string,
    signingMethod: SigningMethod,
    data: {} = {},
  ): Promise<Data> {
    const requestPath: string = `/v3/${endpoint}`;
    const timestamp: ISO8601 = this.clock.getAdjustedIsoString();
    const body: string = JSON.stringify(data);
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

  protected async post(
    endpoint: string,
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<Data> {
    return this.request(ApiMethod.POST, endpoint, ethereumAddress, signingMethod);
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
   * @description have an auto-generated apikey, secret and passphrase generated
   * for an ethereumAddress.
   * @param ethereumAddress the apiKey will be for
   * @param signingMethod used to validate the request
   */
  async createApiKey(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<{ apiKey: ApiKeyCredentials }> {
    return this.post('api-keys', ethereumAddress, signingMethod);
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
