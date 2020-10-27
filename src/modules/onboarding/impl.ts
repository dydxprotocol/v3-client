import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';

export default class Onboarding {
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
    // TODO: Get ethereumAddress from the provider (same address used for signing).
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

  createUser(
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
}
