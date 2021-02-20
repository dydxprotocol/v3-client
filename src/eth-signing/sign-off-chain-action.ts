import BigNumber from 'bignumber.js';
import Web3 from 'web3';

import {
  SigningMethod,
  SignatureTypes,
  Address,
  EthereumAccount,
} from '../types';
import {
  EIP712_DOMAIN_STRING_NO_CONTRACT,
  EIP712_DOMAIN_STRUCT_NO_CONTRACT,
  addressesAreEqual,
  createTypedSignature,
  ecRecoverTypedSignature,
  hashString,
} from './helpers';
import { Signer } from './signer';

type EIP712Struct = {
  type: string;
  name: string;
}[];

export abstract class SignOffChainAction<M extends {}> extends Signer {
  protected readonly networkId: number;
  private readonly actionStruct: EIP712Struct;
  private readonly domain: string;
  private readonly version: string;

  constructor(
    web3: Web3,
    networkId: number,
    actionStruct: EIP712Struct,
    {
      domain = 'dYdX',
      version = '1.0',
    }: {
      domain?: string;
      version?: string;
    } = {},
  ) {
    super(web3);
    this.networkId = networkId;
    this.actionStruct = actionStruct;
    this.domain = domain;
    this.version = version;
  }

  public abstract getHash(message: M): string;

  public async sign(
    signer: string,
    signingMethod: SigningMethod,
    message: M,
  ): Promise<string> {
    switch (signingMethod) {
      case SigningMethod.Hash:
      case SigningMethod.UnsafeHash:
      case SigningMethod.Compatibility: {
        const hash = this.getHash(message);

        // If the address is in the wallet, sign with it so we don't have to use the web3 provider.
        const walletAccount: EthereumAccount | undefined = (
          // Hack: The TypeScript type incorrectly has index signature on number but not string.
          this.web3.eth.accounts.wallet[signer as unknown as number]
        );

        const rawSignature = walletAccount
          ? walletAccount.sign(hash).signature
          : await this.web3.eth.sign(hash, signer);

        const hashSig = createTypedSignature(rawSignature, SignatureTypes.DECIMAL);
        if (signingMethod === SigningMethod.Hash) {
          return hashSig;
        }

        const unsafeHashSig = createTypedSignature(rawSignature, SignatureTypes.NO_PREPEND);
        if (signingMethod === SigningMethod.UnsafeHash) {
          return unsafeHashSig;
        }

        if (this.verify(unsafeHashSig, signer, message)) {
          return unsafeHashSig;
        }
        return hashSig;
      }

      case SigningMethod.TypedData:
      case SigningMethod.MetaMask:
      case SigningMethod.MetaMaskLatest:
      case SigningMethod.CoinbaseWallet: {
        const data = {
          types: {
            EIP712Domain: EIP712_DOMAIN_STRUCT_NO_CONTRACT,
            [this.domain]: this.actionStruct,
          },
          domain: this.getDomainData(),
          primaryType: this.domain,
          message,
        };
        return this.ethSignTypedDataInternal(
          signer,
          data,
          signingMethod,
        );
      }

      default:
        throw new Error(`Invalid signing method ${signingMethod}`);
    }
  }

  public verify(
    typedSignature: string,
    expectedSigner: Address,
    message: M,
  ): boolean {
    const hash = this.getHash(message);
    const signer = ecRecoverTypedSignature(hash, typedSignature);
    return addressesAreEqual(signer, expectedSigner);
  }

  public getDomainHash(): string {
    const hash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes32', v: hashString(EIP712_DOMAIN_STRING_NO_CONTRACT) },
      { t: 'bytes32', v: hashString(this.domain) },
      { t: 'bytes32', v: hashString(this.version) },
      { t: 'uint256', v: new BigNumber(this.networkId).toFixed(0) },
    );
    // Non-null assertion operator is safe, hash is null only on empty input.
    return hash!;
  }

  private getDomainData() {
    return {
      name: this.domain,
      version: this.version,
      chainId: this.networkId,
    };
  }
}
