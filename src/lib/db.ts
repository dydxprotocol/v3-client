import * as uuid from 'uuid';

export function getUserId(
  address: string,
): string {
  return uuid.v5(Buffer.from(address), '0f9da948-a6fb-4c45-9edc-4685c3f3317d');
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
    '0f9da948-a6fb-4c45-9edc-4685c3f3317d',
  );
}
