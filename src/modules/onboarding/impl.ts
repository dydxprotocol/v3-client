import Web3 from 'web3';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { ONBOARDING_STATIC_STRING } from '../../lib/constants';

export default class Onboarding {
  readonly host: string;
  readonly web3Provider: Web3;

  constructor(
    host: string,
    web3Provider: Web3,
  ) {
    this.host = host;
    this.web3Provider = web3Provider;
  }

  protected async post(
    endpoint: string,
    data: {},
    // TODO: Get ethereumAddress from the provider (same address used for signing).
    ethereumAddress: string,
  ): Promise<{}> {
    const signature: string = await this.signRequest(ethereumAddress);

    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-SIGNATURE': signature,
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  async createUser(
    params: {
      starkKey: string,
      apiKey: string,
    },
    ethereumAddress: string,
  ): Promise<{}> {
    return this.post(
      'onboarding',
      params,
      ethereumAddress,
    );
  }

  async signRequest(address: string): Promise<string> {
    return this.web3Provider.eth.sign(ONBOARDING_STATIC_STRING, address);
  }
}
