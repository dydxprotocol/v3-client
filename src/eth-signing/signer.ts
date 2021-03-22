import { promisify } from 'es6-promisify';
import Web3 from 'web3';
import { AbstractProvider } from 'web3-core';
import {
  JsonRpcPayload,
  JsonRpcResponse,
} from 'web3-core-helpers';

import {
  SignatureTypes,
  SigningMethod,
} from '../types';
import { createTypedSignature, stripHexPrefix } from './helpers';

export abstract class Signer {
  protected readonly web3: Web3;

  // ============ Constructor ============

  constructor(
    web3: Web3,
  ) {
    this.web3 = web3;
  }

  // ============ Functions ============

  /**
   * Returns a signable EIP712 Hash of a struct
   */
  public getEIP712Hash(
    structHash: string,
  ): string {
    const hash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes2', v: '0x1901' },
      { t: 'bytes32', v: this.getDomainHash() as string },
      { t: 'bytes32', v: structHash },
    );
    // Non-null assertion operator is safe, hash is null only on empty input.
    return hash!;
  }

  /**
   * Returns the EIP712 domain separator hash.
   */
  public abstract getDomainHash(): string;

  protected async ethSignTypedDataInternal(
    signer: string,
    data: {},
    signingMethod: SigningMethod,
  ): Promise<string> {
    let rpcMethod: string;
    let rpcData: {};

    let provider = this.web3.currentProvider;
    if (provider === null) {
      throw new Error('Cannot sign since Web3 currentProvider is null');
    }
    if (typeof provider === 'string') {
      throw new Error('Cannot sign since Web3 currentProvider is a string');
    }
    provider = provider as AbstractProvider;

    let sendAsync: (param: JsonRpcPayload) => Promise<JsonRpcResponse>;

    switch (signingMethod) {
      case SigningMethod.TypedData:
        sendAsync = promisify(provider.send!).bind(provider);
        rpcMethod = 'eth_signTypedData';
        rpcData = data;
        break;
      case SigningMethod.MetaMask:
        sendAsync = promisify(provider.sendAsync).bind(provider);
        rpcMethod = 'eth_signTypedData_v3';
        rpcData = JSON.stringify(data);
        break;
      case SigningMethod.MetaMaskLatest:
        sendAsync = promisify(provider.sendAsync).bind(provider);
        rpcMethod = 'eth_signTypedData_v4';
        rpcData = JSON.stringify(data);
        break;
      case SigningMethod.CoinbaseWallet:
        sendAsync = promisify(provider.sendAsync).bind(provider);
        rpcMethod = 'eth_signTypedData_v4';
        rpcData = data;
        break;
      default:
        throw new Error(`Invalid signing method ${signingMethod}`);
    }

    const response = await sendAsync({
      method: rpcMethod,
      params: [signer, rpcData],
      jsonrpc: '2.0',
      id: Date.now(),
    });

    if (response.error) {
      throw new Error((response.error as unknown as { message: string }).message);
    }
    return `0x${stripHexPrefix(response.result)}0${SignatureTypes.NO_PREPEND}`;
  }

  /**
   * Sign a message with `personal_sign`.
   */
  protected async ethSignPersonalInternal(
    signer: string,
    message: string,
  ): Promise<string> {
    let provider = this.web3.currentProvider;
    if (provider === null) {
      throw new Error('Cannot sign since Web3 currentProvider is null');
    }
    if (typeof provider === 'string') {
      throw new Error('Cannot sign since Web3 currentProvider is a string');
    }
    provider = provider as AbstractProvider;

    const sendAsync: (param: JsonRpcPayload) => Promise<JsonRpcResponse> = (
      promisify(provider.sendAsync || provider.send).bind(provider)
    );
    const rpcMethod = 'personal_sign';

    const response = await sendAsync({
      method: rpcMethod,
      params: [signer, message],
      jsonrpc: '2.0',
      id: Date.now(),
    });

    if (response.error) {
      throw new Error((response.error as unknown as { message: string }).message);
    }
    // Note: Using createTypedSignature() fixes the signature `v` value.
    return createTypedSignature(response.result, SignatureTypes.PERSONAL);
  }
}
