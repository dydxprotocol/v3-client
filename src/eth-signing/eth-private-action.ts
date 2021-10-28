import Web3 from 'web3';

import { EthPrivateAction } from '../types';
import { hashString } from './helpers';
import { SignOffChainAction } from './sign-off-chain-action';

const EIP712_ETH_PRIVATE_ACTION_STRUCT = [
  { type: 'string', name: 'method' },
  { type: 'string', name: 'requestPath' },
  { type: 'string', name: 'body' },
  { type: 'string', name: 'timestamp' },
];
const EIP712_ETH_PRIVATE_ACTION_STRUCT_STRING = (
  'dYdX(' +
  'string method,' +
  'string requestPath,' +
  'string body,' +
  'string timestamp' +
  ')'
);

export class SignEthPrivateAction extends SignOffChainAction<EthPrivateAction> {

  constructor(
    web3: Web3,
    networkId: number,
  ) {
    super(web3, networkId, EIP712_ETH_PRIVATE_ACTION_STRUCT);
  }

  public getHash(
    message: EthPrivateAction,
  ): string {
    const structHash: string | null = Web3.utils.soliditySha3(
      { t: 'bytes32', v: hashString(EIP712_ETH_PRIVATE_ACTION_STRUCT_STRING) },
      { t: 'bytes32', v: hashString(message.method) },
      { t: 'bytes32', v: hashString(message.requestPath) },
      { t: 'bytes32', v: hashString(message.body) },
      { t: 'bytes32', v: hashString(message.timestamp) },
    );
    // Non-null assertion operator is safe, hash is null only on empty input.
    return this.getEIP712Hash(structHash!);
  }
}
