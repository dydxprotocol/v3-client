export function generateQueryPath(url: string, params: {}): string {
  const entries = Object.entries(params);
  if (!entries.length) {
    return url;
  }

  const paramsString = entries.map(
    (kv) => `${kv[0]}=${kv[1]}`,
  ).join('&');
  return `${url}?${paramsString}`;
}
