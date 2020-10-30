/* eslint-disable @typescript-eslint/no-explicit-any */
import { promisify } from 'es6-promisify';
import Web3 from 'web3';

import {
  stripHexPrefix,
} from '../lib/eth-validation/signature-helper';
import {
  SignatureTypes,
  SigningMethod,
} from '../types';

export abstract class Signer {
  protected web3: Web3;

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

    if (!hash) {
      throw new Error(`Invalid structHash: ${structHash}`);
    }

    return hash;
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

    const provider: any = this.web3.currentProvider!;
    let sendAsync: any;

    switch (signingMethod) {
      case SigningMethod.TypedData:
        sendAsync = promisify(provider.send).bind(provider);
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
        rpcMethod = 'eth_signTypedData';
        rpcData = data;
        break;
      default:
        throw new Error(`Invalid signing method ${signingMethod}`);
    }

    const response = await sendAsync({
      method: rpcMethod,
      params: [signer, rpcData],
      jsonrpc: '2.0',
      id: new Date().getTime(),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }
    return `0x${stripHexPrefix(response.result)}0${SignatureTypes.NO_PREPEND}`;
  }
}
