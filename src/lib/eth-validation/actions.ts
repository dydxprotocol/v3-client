import { ApiMethod } from '@dydxprotocol/starkex-lib';

const ONBOARDING_STATIC_STRING: string = 'DYDX-ONBOARDING';

export function generateOnboardingAction(): string {
  return ONBOARDING_STATIC_STRING;
}

export function generateApiKeyAction({
  requestPath,
  method,
  data,
}: {
  requestPath: string,
  method: ApiMethod,
  data?: {},
}): string {

  const body: string = data ? JSON.stringify(data) : '';
  return body +
  requestPath +
  method;
}
