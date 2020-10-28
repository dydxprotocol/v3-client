import Web3 from 'web3';

import {
  createTypedSignature,
  EIP712_DOMAIN_STRUCT_NO_CONTRACT,
  ecRecoverTypedSignature,
  addressesAreEqual,
  hashString,
  EIP712_DOMAIN_STRING_NO_CONTRACT,
  toString,
} from '../lib/eth-validation/signature-helper';
import {
  SigningMethod,
  SignatureTypes,
  Address,
} from '../types';
import { Signer } from './signer';

const EIP712_WALLET_OFF_CHAIN_ACTION_ALL_STRUCT = [
  { type: 'string', name: 'action' },
  { type: 'string', name: 'expiration' },
];

export class SignOffChainAction extends Signer {
  private domain: string;
  private version: string;
  private networkId: number;
  private EIP712_OFF_CHAIN_ACTION_ALL_STRUCT_STRING: string;

  constructor(
    web3: Web3,
    networkId: number,
    {
      domain = 'dYdX',
      version = '1.0',
    }: {
      domain?: string;
      version?: string;
    } = {},
  ) {
    super(web3);
    this.domain = domain;
    this.networkId = networkId;
    this.version = version;
    this.EIP712_OFF_CHAIN_ACTION_ALL_STRUCT_STRING = 'dYdX(' +
      'string action,' +
      'string expiration' +
      ')';
  }

  public async signOffChainAction(
    expiration: Date,
    signer: string,
    signingMethod: SigningMethod,
    action: string,
  ): Promise<string> {
    switch (signingMethod) {
      case SigningMethod.Hash:
      case SigningMethod.UnsafeHash:
      case SigningMethod.Compatibility: {
        const hash = this.getOffChainActionHash(expiration, action);
        const rawSignature = await this.web3.eth.sign(hash, signer);
        const hashSig = createTypedSignature(rawSignature, SignatureTypes.DECIMAL);
        if (signingMethod === SigningMethod.Hash) {
          return hashSig;
        }
        const unsafeHashSig = createTypedSignature(rawSignature, SignatureTypes.NO_PREPEND);
        if (signingMethod === SigningMethod.UnsafeHash) {
          return unsafeHashSig;
        }
        if (this.signOffChainActionIsValid(expiration, unsafeHashSig, signer, action)) {
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
            [this.domain]: EIP712_WALLET_OFF_CHAIN_ACTION_ALL_STRUCT,
          },
          domain: this.getDomainData(),
          primaryType: this.domain,
          message: {
            action,
            expiration: expiration.toUTCString(),
          },
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

  public signOffChainActionIsValid(
    expiration: Date,
    typedSignature: string,
    expectedSigner: Address,
    action: string,
  ): boolean {
    const hash = this.getOffChainActionHash(expiration, action);
    const signer = ecRecoverTypedSignature(hash, typedSignature);
    return (addressesAreEqual(signer, expectedSigner) && expiration > new Date());
  }

  public getDomainHash(): string {
    const hash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes32', v: hashString(EIP712_DOMAIN_STRING_NO_CONTRACT) },
      { t: 'bytes32', v: hashString(this.domain) },
      { t: 'bytes32', v: hashString(this.version) },
      { t: 'uint256', v: toString(this.networkId) },
    );

    if (!hash) {
      throw new Error(`Could not get domain hash with domain: ${this.domain}`);
    }

    return hash;
  }

  public getOffChainActionHash(
    expiration: Date,
    action: string,
  ): string {
    const structHash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes32', v: hashString(this.EIP712_OFF_CHAIN_ACTION_ALL_STRUCT_STRING) },
      { t: 'bytes32', v: hashString(action) },
      { t: 'bytes32', v: hashString(expiration.toUTCString()) },
    );

    if (!structHash) {
      throw new Error(`Cannot get OffchainAction for: ${action}`);
    }

    return this.getEIP712Hash(structHash);
  }

  private getDomainData() {
    return {
      name: this.domain,
      version: this.version,
      chainId: this.networkId,
    };
  }
}
