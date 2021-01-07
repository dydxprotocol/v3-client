import { ApiMethod } from '@dydxprotocol/starkex-lib';
import _ from 'lodash';

const ONBOARDING_STATIC_STRING: string = 'DYDX-ONBOARDING';

export function generateOnboardingAction(): string {
  return ONBOARDING_STATIC_STRING;
}

export function generateApiKeyAction({
  requestPath,
  method,
  data = {},
}: {
  requestPath: string,
  method: ApiMethod,
  data?: {},
}): string {
  return (
    method +
    requestPath +
    (_.isEmpty(data) ? '' : JSON.stringify(data))
  );
}
