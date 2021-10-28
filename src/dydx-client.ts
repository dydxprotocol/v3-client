import { StarkwareLib } from '@dydxprotocol/starkex-eth';
import { KeyPair } from '@dydxprotocol/starkex-lib';
import Web3 from 'web3';

import Clock from './modules/clock';
import EthPrivate from './modules/eth-private';
import Onboarding from './modules/onboarding';
import Private from './modules/private';
import Public from './modules/public';
import {
  ApiKeyCredentials,
  EthereumSendOptions,
  Provider,
} from './types';

export interface ClientOptions {
  apiTimeout?: number;
  ethSendOptions?: EthereumSendOptions;
  networkId?: number;
  starkPrivateKey?: string | KeyPair;
  web3?: Web3;
  web3Provider?: string | Provider;
  apiKeyCredentials?: ApiKeyCredentials;
  timestampAdjustment?: number;
}

export class DydxClient {
  readonly host: string;
  readonly apiTimeout?: number;
  readonly ethSendOptions?: EthereumSendOptions;
  readonly networkId: number;
  readonly starkPrivateKey?: string | KeyPair;
  readonly web3?: Web3;
  apiKeyCredentials?: ApiKeyCredentials;

  // Modules.
  private readonly _public: Public;
  private readonly _clock: Clock;

  // Modules. These are created on-demand.
  private _private?: Private;
  private _ethPrivate?: EthPrivate;
  private _onboarding?: Onboarding;
  private _eth?: StarkwareLib;

  constructor(
    host: string,
    options: ClientOptions = {},
  ) {
    this.host = host;
    this.apiTimeout = options.apiTimeout;
    this.ethSendOptions = options.ethSendOptions;
    this.networkId = typeof options.networkId === 'number' ? options.networkId : 1;
    this.starkPrivateKey = options.starkPrivateKey;
    this.apiKeyCredentials = options.apiKeyCredentials;

    if (options.web3 || options.web3Provider) {
      // Non-null assertion is safe due to if-condition.
      this.web3 = options.web3 || new Web3(options.web3Provider!);
    }

    // Modules.
    this._public = new Public(host);
    this._clock = new Clock(options.timestampAdjustment);
  }

  /**
   * Get the public module, used for interacting with public endpoints.
   */
  get public(): Public {
    return this._public;
  }

  /**
   * Get the clock module, used for adjusting system time to server time.
   */
  get clock(): Clock {
    return this._clock;
  }

  /**
   * Get the private module, used for interacting with endpoints that require API-key auth.
   */
  get private(): Private {
    if (!this._private) {
      if (this.apiKeyCredentials) {
        this._private = new Private({
          host: this.host,
          apiKeyCredentials: this.apiKeyCredentials,
          starkPrivateKey: this.starkPrivateKey,
          networkId: this.networkId,
          clock: this._clock,
        });
      } else {
        return notSupported(
          'Private endpoints are not supported since apiKeyCredentials was not provided',
        ) as Private;
      }
    }
    return this._private;
  }

  /**
   * Get the keys module, used for managing API keys. Requires Ethereum key auth.
   */
  get ethPrivate(): EthPrivate {
    if (!this._ethPrivate) {
      if (this.web3) {
        this._ethPrivate = new EthPrivate({
          host: this.host,
          web3: this.web3,
          networkId: this.networkId,
          clock: this._clock,
        });
      } else {
        return notSupported(
          'Eth private endpoints are not supported since neither web3 nor web3Provider was provided',
        ) as EthPrivate;
      }
    }
    return this._ethPrivate;
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
