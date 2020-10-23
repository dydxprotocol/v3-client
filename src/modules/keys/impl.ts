import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';

export default class Keys {
  readonly host: string;
  readonly web3Provider: {};

  constructor(
    host: string,
    web3Provider: {},
  ) {
    this.host = host;
    this.web3Provider = web3Provider;
  }

  protected async post(
    endpoint: string,
    data: {},
    ethereumAddress: string,
  ): Promise<{}> {
    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-ETHEREUM-ADDRESS': ethereumAddress,
      },
    });
  }

  getApiKeys(): void {}

  async registerApiKey(
    apiKey: string,
    ethereumAddress: string,
  ): Promise<{}> {
    return this.post('api-keys', { apiKey }, ethereumAddress);
  }

  deleteApiKey(): void {}
}
