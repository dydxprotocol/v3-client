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
  // TODO: The signed data should be consistent with the other private endpoints.
  return (
    (_.isEmpty(data) ? '' : JSON.stringify(data)) +
    requestPath +
    method
  );
}
