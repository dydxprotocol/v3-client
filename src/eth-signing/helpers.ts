import { ethers } from 'ethers';
import Web3 from 'web3';

import { Address, SignatureTypes } from '../types';

/**
 * Ethereum signed message prefix without message length.
 */
export const PREPEND_PERSONAL: string = '\x19Ethereum Signed Message:\n';

/**
 * Ethereum signed message prefix, 32-byte message, with message length represented as a string.
 */
export const PREPEND_DEC: string = '\x19Ethereum Signed Message:\n32';

/**
 * Ethereum signed message prefix, 32-byte message, with message length as a one-byte integer.
 */
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

const ROTATED_V_VALUES: { [v: string]: string } = {
  '00': '1b',
  '01': '1c',
  '1b': '00',
  '1c': '01',
};

// PERSONAL and NO_PREPEND are the only SignatureTypes the frontend app deal with.
const ROTATED_T_VALUES: { [t: string]: string } = {
  [`0${SignatureTypes.NO_PREPEND}`]: `0${SignatureTypes.PERSONAL}`,
  [`0${SignatureTypes.PERSONAL}`]: `0${SignatureTypes.NO_PREPEND}`,
};

export function isValidSigType(
  sigType: number,
): boolean {
  switch (sigType) {
    case SignatureTypes.NO_PREPEND:
    case SignatureTypes.DECIMAL:
    case SignatureTypes.HEXADECIMAL:
    case SignatureTypes.PERSONAL:
      return true;
    default:
      return false;
  }
}

/**
 * Recover the address used to sign a given hash or message.
 *
 * The string `hashOrMessage` is a hash, unless the signature has type SignatureTypes.PERSONAL, in
 * which case it is the signed message.
 */
export function ecRecoverTypedSignature(
  hashOrMessage: string,
  typedSignature: string,
): Address {
  const sigType = parseInt(typedSignature.slice(-2), 16);

  let prependedHash: string | null;
  switch (sigType) {
    case SignatureTypes.NO_PREPEND:
      prependedHash = hashOrMessage;
      break;
    case SignatureTypes.PERSONAL: {
      const fullMessage = `${PREPEND_PERSONAL}${hashOrMessage.length}${hashOrMessage}`;
      prependedHash = Web3.utils.soliditySha3(
        { t: 'string', v: fullMessage },
      );
      break;
    }
    case SignatureTypes.DECIMAL:
      prependedHash = Web3.utils.soliditySha3(
        { t: 'string', v: PREPEND_DEC },
        { t: 'bytes32', v: hashOrMessage },
      );
      break;
    case SignatureTypes.HEXADECIMAL:
      prependedHash = Web3.utils.soliditySha3(
        { t: 'string', v: PREPEND_HEX },
        { t: 'bytes32', v: hashOrMessage },
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

/**
 * @description get signatures that have a rotated 'v' value, a rotated 't' value, and
 * have both values rotated. If 'v' or 't' cannot be rotated they will keep their original values.
 *
 * @param signature to rotate
 *
 * @throws Error if signature has an invalid length
 *
 * @returns the list of signatures in the following order:
 * [0]: original
 * [1]: rotated 'v' value
 * [2]: rotated 't' value
 * [3]: rotated 'v' and 't' value
 */
export function getAllSignatureRotations(signature: string): string[] {
  const stripped = stripHexPrefix(signature);
  const rs = stripped.slice(0, 128);
  const v = stripped.slice(128, 130);
  const t = stripped.slice(130, 132);
  const rotatedV: string = ROTATED_V_VALUES[v] || v;
  const rotatedT: string = ROTATED_T_VALUES[t] || t;

  if (stripped.length !== 132) {
    throw new Error(`Invalid signature: ${signature}`);
  }

  return [
    `0x${stripped}`,
    `0x${rs}${rotatedV}${t}`,
    `0x${rs}${v}${rotatedT}`,
    `0x${rs}${rotatedV}${rotatedT}`,
  ];
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
