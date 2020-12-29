import {
  KeyPair,
} from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import Eth from './modules/eth';
import Keys from './modules/keys';
import Onboarding from './modules/onboarding';
import Private from './modules/private';
import Public from './modules/public';
import { SignOffChainAction } from './modules/sign-off-chain-action';
import { Provider } from './types';

export interface ClientOptions {
  apiTimeout?: number;
  apiPrivateKey?: string | KeyPair;
  networkId?: number;
  starkPrivateKey?: string | KeyPair;
  web3?: Web3;
  web3Provider?: Provider;
}

export default class DydxClient {
  readonly host: string;
  readonly apiTimeout?: number;
  readonly apiPrivateKey?: string | KeyPair;
  readonly starkPrivateKey?: string | KeyPair;
  readonly web3?: Web3;
  readonly signOffChainAction?: SignOffChainAction;

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

    if (options.web3 || options.web3Provider) {
      const networkId = typeof options.networkId === 'number' ? options.networkId : 1;
      // Non-null assertion is safe due to if-condition.
      this.web3 = options.web3 || new Web3(options.web3Provider!);
      this.signOffChainAction = new SignOffChainAction(
        this.web3,
        networkId,
      );
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
      if (this.apiPrivateKey) {
        this._private = new Private(
          this.host,
          this.apiPrivateKey,
          this.starkPrivateKey,
        );
      } else {
        return notSupported(
          'Private endpoints are not supported since apiPrivateKey was not provided',
        ) as Private;
      }
    }
    return this._private;
  }

  /**
   * Get the keys module, used for managing API keys. Requires Ethereum key auth.
   */
  get keys(): Keys {
    if (!this._keys) {
      if (this.signOffChainAction) {
        this._keys = new Keys(this.host, this.signOffChainAction);
      } else {
        return notSupported(
          'API key endpoints are not supported since neither web3 nor web3Provider was provided',
        ) as Keys;
      }
    }
    return this._keys;
  }

  /**
   * Get the onboarding module, used to create a new user. Requires Ethereum key auth.
   */
  get onboarding(): Onboarding {
    if (!this._onboarding) {
      if (this.signOffChainAction) {
        this._onboarding = new Onboarding(this.host, this.signOffChainAction);
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
        this._eth = new Eth(this.web3);
      } else {
        return notSupported(
          'Eth endpoints are not supported since neither web3 nor web3Provider was provided',
        ) as Eth;
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
