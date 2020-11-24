import {
  RequestMethod,
  axiosRequest,
} from '../lib/axios';
import { generateOnboardingAction } from '../lib/eth-validation/actions';
import {
  SigningMethod,
  AccountResponseObject,
  Data,
  UserResponseObject,
} from '../types';
import { SignOffChainAction } from './sign-off-chain-action';

export default class Onboarding {
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

  protected async post(
    endpoint: string,
    data: {},
    ethereumAddress: string,
  ): Promise<Data> {
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
}
