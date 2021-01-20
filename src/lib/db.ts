// TODO: Get rid of this file.

import * as uuid from 'uuid';

const UUID_NAMESPACE: string = '0f9da948-a6fb-4c45-9edc-4685c3f3317d';

export function getUserId(
  address: string,
): string {
  return uuid.v5(Buffer.from(address.toLowerCase()), UUID_NAMESPACE);
}

export function getAccountId({
  address,
  accountNumber = '0',
}: {
  address: string,
  accountNumber?: string,
}) {
  return uuid.v5(
    Buffer.from(`${getUserId(address)}${accountNumber}`),
    UUID_NAMESPACE,
  );
}
