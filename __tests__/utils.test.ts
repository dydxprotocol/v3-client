/**
 * Unit tests for helper and utility functions in src.
 */

import { generateQueryPath } from '../src/helpers/request-helpers';

describe('request-helpers', () => {

  it('generateQueryPath', async () => {
    expect(generateQueryPath('url', {
      param1: 'value1',
      param2: undefined,
      param3: 3,
    })).toEqual('url?param1=value1&param3=3');
  });
});
