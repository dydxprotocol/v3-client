import { DydxClient } from './dydx-client';
import {
  AccountLeaderboardPnlPeriod, ApiKeyCredentials,
  LeaderboardPnlPeriod, LeaderboardPnlSortBy } from './types';

export { DydxClient } from './dydx-client';
export * from './eth-signing';
export * from './types';

async function runTask() {

  const apiKeyCredentials: ApiKeyCredentials = {
    key: '5b7faef0-7c79-a35c-bc48-3cfd7a76c25a',
    secret: '25QTENsTHYncWcIou3aflodeZ7P8swBStSF2tqcQ',
    passphrase: 'H2N-0GZpjBsRBodLskYi',
  };

  const client = new DydxClient('https://api.stage.dydx.exchange', { apiKeyCredentials });
  const result = await client.private.getAccountLeaderboardPnl(
    AccountLeaderboardPnlPeriod.LEAGUES,
    { startedBeforeOrAt: (new Date()).toISOString() },
  );
  console.log(result);

  const secondResult = await client.public.getLeaderboardPnls({
    period: LeaderboardPnlPeriod.SILVER,
    sortBy: LeaderboardPnlSortBy.PERCENT,
    startingBeforeOrAt: (new Date()).toISOString(),
  });
  console.log(secondResult);
}

// eslint-disable-next-line no-void
void runTask();
