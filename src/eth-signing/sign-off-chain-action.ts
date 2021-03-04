import BigNumber from 'bignumber.js';
import * as ethers from 'ethers';
import _ from 'lodash';
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
  stripHexPrefix,
} from './helpers';
import { Signer } from './signer';

// IMPORTANT: The order of these params affects the message signed with SigningMethod.PERSONAL.
//            The message should not be changed at all since it's used to generated default keys.
const PERSONAL_SIGN_DOMAIN_PARAMS = ['name', 'version', 'chainId'];

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
    // If the address is in the wallet, sign with it so we don't have to use the web3 provider.
    const walletAccount: EthereumAccount | undefined = (
      // Hack: The TypeScript type incorrectly has index signature on number but not string.
      this.web3.eth.accounts.wallet[signer as unknown as number]
    );

    switch (signingMethod) {
      case SigningMethod.Hash:
      case SigningMethod.UnsafeHash:
      case SigningMethod.Compatibility: {
        const hash = this.getHash(message);

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

      // @ts-ignore Fallthrough case in switch.
      case SigningMethod.TypedData:
        // If the private key is available locally, sign locally without using web3.
        if (walletAccount?.privateKey) {
          const wallet = new ethers.Wallet(walletAccount.privateKey);
          const rawSignature = await wallet._signTypedData(
            this.getDomainData(),
            { [this.domain]: this.actionStruct },
            message,
          );
          return createTypedSignature(rawSignature, SignatureTypes.NO_PREPEND);
        }

        /* falls through */
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

      case SigningMethod.Personal: {
        const messageString = this.getPersonalSignMessage(message);
        return this.ethSignPersonalInternal(signer, messageString);
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
    if (stripHexPrefix(typedSignature).length !== 66 * 2) {
      throw new Error(`Unable to verify signature with invalid length: ${typedSignature}`);
    }

    const sigType = parseInt(typedSignature.slice(-2), 16);
    let hashOrMessage: string;
    switch (sigType) {
      case SignatureTypes.NO_PREPEND:
      case SignatureTypes.DECIMAL:
      case SignatureTypes.HEXADECIMAL:
        hashOrMessage = this.getHash(message);
        break;
      case SignatureTypes.PERSONAL:
        hashOrMessage = this.getPersonalSignMessage(message);
        break;
      default:
        throw new Error(`Invalid signature type: ${sigType}`);
    }

    const signer = ecRecoverTypedSignature(hashOrMessage, typedSignature);
    return addressesAreEqual(signer, expectedSigner);
  }

  /**
   * Get the message string to be signed when using SignatureTypes.PERSONAL.
   *
   * This signing method may be used in cases where EIP-712 signing is not possible.
   */
  public getPersonalSignMessage(
    message: M,
  ): string {
    // Make sure the output is deterministic for a given input.
    return JSON.stringify({
      ..._.pick(this.getDomainData(), PERSONAL_SIGN_DOMAIN_PARAMS),
      ..._.pick(message, _.keys(message).sort()),
    }, null, 2);
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
