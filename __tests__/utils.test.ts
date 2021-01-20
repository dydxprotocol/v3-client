/**
 * Unit tests for helper and utility functions in src.
 */

import { generateQueryPath } from '../src/helpers/request-helpers';

describe('request-helpers', () => {

  describe('generateQueryPath', () => {
    it('creates query path', async () => {
      expect(generateQueryPath('url', {
        param1: 'value1',
        param2: undefined,
        param3: 3,
      })).toEqual('url?param1=value1&param3=3');
    });

    it('creates empty query path', async () => {
      expect(generateQueryPath('url', { param1: undefined })).toEqual('url');
      expect(generateQueryPath('url', {})).toEqual('url');
    });
  });
});
