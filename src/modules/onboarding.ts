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
    signature: string | null = null,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<Data> {
    const url: string = `/v3/${endpoint}`;
    return axiosRequest({
      url: `${this.host}${url}`,
      method: RequestMethod.POST,
      data,
      headers: {
        'DYDX-SIGNATURE': signature || await this.sign(ethereumAddress, signingMethod),
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
    signature?: string,
  ): Promise<{
      apiKey: string,
      user: UserResponseObject,
      account: AccountResponseObject,
    }> {
    return this.post(
      'onboarding',
      params,
      ethereumAddress,
      signature,
    );
  }

  // ============ Signing ============

  public async sign(
    ethereumAddress: string,
    signingMethod: SigningMethod = SigningMethod.Hash,
  ): Promise<string> {
    return this.signOffChainAction.signOffChainAction(
      ethereumAddress,
      signingMethod,
      generateOnboardingAction(),
    );
  }
}
