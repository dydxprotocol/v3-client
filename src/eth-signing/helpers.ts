import { ethers } from 'ethers';
import Web3 from 'web3';

import { Address, SignatureTypes } from '../types';

export const PREPEND_DEC: string = '\x19Ethereum Signed Message:\n32';

export const PREPEND_HEX: string = '\x19Ethereum Signed Message:\n\x20';

export const EIP712_DOMAIN_STRING: string = 'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';

export const EIP712_DOMAIN_STRUCT = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

export const EIP712_DOMAIN_STRING_NO_CONTRACT: string = 'EIP712Domain(string name,string version,uint256 chainId)';

export const EIP712_DOMAIN_STRUCT_NO_CONTRACT = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
];

export function isValidSigType(
  sigType: number,
): boolean {
  switch (sigType) {
    case SignatureTypes.NO_PREPEND:
    case SignatureTypes.DECIMAL:
    case SignatureTypes.HEXADECIMAL:
      return true;
    default:
      return false;
  }
}

export function ecRecoverTypedSignature(
  hash: string,
  typedSignature: string,
): Address {
  if (stripHexPrefix(typedSignature).length !== 66 * 2) {
    throw new Error(`Unable to ecrecover signature: ${typedSignature}`);
  }

  const sigType = parseInt(typedSignature.slice(-2), 16);

  let prependedHash: string | null;
  switch (sigType) {
    case SignatureTypes.NO_PREPEND:
      prependedHash = hash;
      break;
    case SignatureTypes.DECIMAL:
      prependedHash = Web3.utils.soliditySha3(
        { t: 'string', v: PREPEND_DEC },
        { t: 'bytes32', v: hash },
      );
      break;
    case SignatureTypes.HEXADECIMAL:
      prependedHash = Web3.utils.soliditySha3(
        { t: 'string', v: PREPEND_HEX },
        { t: 'bytes32', v: hash },
      );
      break;
    default:
      throw new Error(`Invalid signature type: ${sigType}`);
  }

  const signature = typedSignature.slice(0, -2);

  // Non-null assertion operator is safe, hash is null only on empty input.
  return ethers.utils.recoverAddress(ethers.utils.arrayify(prependedHash!), signature);
}

export function createTypedSignature(
  signature: string,
  sigType: number,
): string {
  if (!isValidSigType(sigType)) {
    throw new Error(`Invalid signature type: ${sigType}`);
  }
  return `${fixRawSignature(signature)}0${sigType}`;
}

/**
 * Fixes any signatures that don't have a 'v' value of 27 or 28
 */
export function fixRawSignature(
  signature: string,
): string {
  const stripped = stripHexPrefix(signature);

  if (stripped.length !== 130) {
    throw new Error(`Invalid raw signature: ${signature}`);
  }

  const rs = stripped.substr(0, 128);
  const v = stripped.substr(128, 2);

  switch (v) {
    case '00':
      return `0x${rs}1b`;
    case '01':
      return `0x${rs}1c`;
    case '1b':
    case '1c':
      return `0x${stripped}`;
    default:
      throw new Error(`Invalid v value: ${v}`);
  }
}

// ============ Byte Helpers ============

export function stripHexPrefix(input: string) {
  if (input.indexOf('0x') === 0) {
    return input.substr(2);
  }
  return input;
}

export function addressesAreEqual(
  addressOne: string,
  addressTwo: string,
): boolean {
  if (!addressOne || !addressTwo) {
    return false;
  }

  return (stripHexPrefix(addressOne).toLowerCase() === stripHexPrefix(addressTwo).toLowerCase());
}

export function hashString(input: string): string {
  const hash: string | null = Web3.utils.soliditySha3({ t: 'string', v: input });
  if (hash === null) {
    throw new Error(`soliditySha3 input was empty: ${input}`);
  }
  return hash;
}
