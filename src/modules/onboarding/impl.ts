import Web3 from 'web3';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { ONBOARDING_STATIC_STRING } from '../../lib/constants';
import { AccountResponseObject, Data, UserResponseObject } from '../../types';

export default class Onboarding {
  readonly host: string;
  readonly web3: Web3;

  constructor(
    host: string,
    web3: Web3,
  ) {
    this.host = host;
    this.web3 = web3;
  }

  protected async post(
    endpoint: string,
    data: {},
    // TODO: Get ethereumAddress from the provider (same address used for signing).
    ethereumAddress: string,
  ): Promise<Data> {
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
  ): Promise<{
      apiKey: string,
      user: UserResponseObject,
      account: AccountResponseObject,
    }> {
    return this.post(
      'onboarding',
      params,
      ethereumAddress,
    );
  }

  async signRequest(address: string): Promise<string> {
    const onboardingHash: string | null = this.web3.utils.sha3(ONBOARDING_STATIC_STRING);
    if (!onboardingHash) {
      throw new Error(`Could not generate an onboarding hash for address: ${address}`);
    }

    return this.web3.eth.sign(onboardingHash, address);
  }
}
