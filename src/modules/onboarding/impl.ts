import Web3 from 'web3';

import {
  RequestMethod,
  axiosRequest,
} from '../../lib/axios';
import { generateOnboardingAction } from '../../lib/eth-validation/actions';
import { SigningMethod } from '../../types';
import { SignOffChainAction } from '../sign-off-chain-action';

export default class Onboarding {
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

  protected async post(
    endpoint: string,
    data: {},
    // TODO: Get ethereumAddress from the provider (same address used for signing).
    ethereumAddress: string,
  ): Promise<{}> {
    const signature: string = await this.signOffChainAction.signOffChainAction(
      ethereumAddress,
      SigningMethod.Hash,
      generateOnboardingAction(),
    );

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

  // ============ Requests ============

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
}
