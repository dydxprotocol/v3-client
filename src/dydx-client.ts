import { StarkwareLib } from '@dydxprotocol/starkex-eth';
import { KeyPair } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import ApiKeys from './modules/api-keys';
import Onboarding from './modules/onboarding';
import Private from './modules/private';
import Public from './modules/public';
import {
  EthereumSendOptions,
  Provider,
} from './types';

export interface ClientOptions {
  apiTimeout?: number;
  apiKey?: string;
  ethSendOptions?: EthereumSendOptions;
  networkId?: number;
  starkPrivateKey?: string | KeyPair;
  web3?: Web3;
  web3Provider?: string | Provider;
  secret?: string;
  passphrase?: string;
}

export class DydxClient {
  readonly host: string;
  readonly apiTimeout?: number;
  readonly apiKey?: string;
  readonly ethSendOptions?: EthereumSendOptions;
  readonly networkId: number;
  readonly starkPrivateKey?: string | KeyPair;
  readonly web3?: Web3;
  readonly secret?: string;
  readonly passphrase?: string;

  // Modules. Except for `public`, these are created on-demand.
  private readonly _public: Public;
  private _private?: Private;
  private _apiKeys?: ApiKeys;
  private _onboarding?: Onboarding;
  private _eth?: StarkwareLib;

  constructor(
    host: string,
    options: ClientOptions = {},
  ) {
    this.host = host;
    this.apiTimeout = options.apiTimeout;
    this.apiKey = options.apiKey;
    this.ethSendOptions = options.ethSendOptions;
    this.networkId = typeof options.networkId === 'number' ? options.networkId : 1;
    this.starkPrivateKey = options.starkPrivateKey;
    this.secret = options.secret;
    this.passphrase = options.passphrase;

    if (options.web3 || options.web3Provider) {
      // Non-null assertion is safe due to if-condition.
      this.web3 = options.web3 || new Web3(options.web3Provider!);
    }

    // Modules.
    this._public = new Public(host);
  }

  /**
   * Get the public module, used for interacting with public endpoints.
   */
  get public(): Public {
    return this._public;
  }

  /**
   * Get the private module, used for interacting with endpoints that require API-key auth.
   */
  get private(): Private {
    if (!this._private) {
      if (this.apiKey && this.secret && this.passphrase) {
        this._private = new Private({
          host: this.host,
          apiKey: this.apiKey,
          secret: this.secret,
          passphrase: this.passphrase,
          starkPrivateKey: this.starkPrivateKey,
        });
      } else {
        return notSupported(
          'Private endpoints are not supported since apiKey, secret or passphrase were not provided',
        ) as Private;
      }
    }
    return this._private;
  }

  /**
   * Get the keys module, used for managing API keys. Requires Ethereum key auth.
   */
  get apiKeys(): ApiKeys {
    if (!this._apiKeys) {
      if (this.web3) {
        this._apiKeys = new ApiKeys(this.host, this.web3, this.networkId);
      } else {
        return notSupported(
          'API key endpoints are not supported since neither web3 nor web3Provider was provided',
        ) as ApiKeys;
      }
    }
    return this._apiKeys;
  }

  /**
   * Get the onboarding module, used to create a new user. Requires Ethereum key auth.
   */
  get onboarding(): Onboarding {
    if (!this._onboarding) {
      if (this.web3) {
        this._onboarding = new Onboarding(this.host, this.web3, this.networkId);
      } else {
        return notSupported(
          'Onboarding endpoints are not supported since neither web3 nor web3Provider was provided',
        ) as Onboarding;
      }
    }
    return this._onboarding;
  }

  /**
   * Get the eth module, used for interacting with Ethereum smart contracts.
   */
  get eth() {
    if (!this._eth) {
      if (this.web3) {
        this._eth = new StarkwareLib(
          this.web3.currentProvider,
          this.networkId,
          this.ethSendOptions,
        );
      } else {
        return notSupported(
          'Eth endpoints are not supported since neither web3 nor web3Provider was provided',
        ) as StarkwareLib;
      }
    }
    return this._eth;
  }
}

/**
 * Returns a proxy object that throws with the given message when trying to call a function on it.
 */
function notSupported(
  errorMessage: string,
): {} {
  const handler = {
    get() {
      throw new Error(errorMessage);
    },
  };
  return new Proxy({}, handler);
}
