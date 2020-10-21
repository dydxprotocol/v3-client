import {
  KeyPair,
} from '@dydxprotocol/starkex-lib';

import {
  Eth,
  EthImpl,
  ethNotSupported,
} from './modules/eth';
import {
  Keys,
  KeysImpl,
  keysNotSupported,
} from './modules/keys';
import {
  Onboarding,
  OnboardingImpl,
  onboardingNotSupported,
} from './modules/onboarding';
import {
  Private,
  PrivateImpl,
  privateNotSupported,
} from './modules/private';
import {
  Public,
  PublicImpl,
} from './modules/public';

export interface ClientOptions {
  apiTimeout?: number;
  apiPrivateKey?: string | KeyPair;
  starkPrivateKey?: string | KeyPair;
  web3Proivder?: {};
}

export default class DydxClient {
  readonly host: string;
  readonly apiTimeout?: number;
  readonly apiPrivateKey?: string | KeyPair;
  readonly starkPrivateKey?: string | KeyPair;
  readonly web3Proivder?: {};

  // Modules. Except for `public`, these are created on-demand.
  private readonly _public: Public;
  private _private?: Private;
  private _keys?: Keys;
  private _onboarding?: Onboarding;
  private _eth?: Eth;

  constructor(
    host: string,
    options: ClientOptions = {},
  ) {
    this.host = host;
    this.apiTimeout = options.apiTimeout;
    this.apiPrivateKey = options.apiPrivateKey;
    this.starkPrivateKey = options.starkPrivateKey;
    this.web3Proivder = options.web3Proivder;

    // Modules.
    this._public = new PublicImpl(host);
  }

  /**
   * Get the public module, used for interacting with public endpoints.
   */
  get public(): Public {
    return this.public;
  }

  /**
   * Get the private module, used for interacting with endpoints that require API-key auth.
   */
  get private(): Private {
    if (!this._private) {
      if (this.apiPrivateKey) {
        this._private = new PrivateImpl(this.apiPrivateKey, this.starkPrivateKey);
      }
      return privateNotSupported;
    }
    return this._private;
  }

  /**
   * Get the keys module, used for managing API keys. Requires Ethereum key auth.
   */
  get keys(): Keys {
    if (!this._keys) {
      if (this.web3Proivder) {
        this._keys = new KeysImpl(this.web3Proivder);
      }
      return keysNotSupported;
    }
    return this._keys;
  }

  /**
   * Get the onboarding module, used to create a new user. Requires Ethereum key auth.
   */
  get onboarding(): Onboarding {
    if (!this._onboarding) {
      if (this.web3Proivder) {
        this._onboarding = new OnboardingImpl(this.web3Proivder);
      }
      return onboardingNotSupported;
    }
    return this._onboarding;
  }

  /**
   * Get the eth module, used for interacting with Ethereum smart contracts.
   */
  get eth() {
    if (!this._eth) {
      if (this.web3Proivder) {
        this._eth = new EthImpl(this.web3Proivder);
      }
      return ethNotSupported;
    }
    return this._eth;
  }
}
