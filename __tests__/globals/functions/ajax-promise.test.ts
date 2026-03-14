import {
  describe,
  expect,
  it
} from 'vitest';

import { ajaxPromise } from '../../../src/globals/functions/ajaxPromise.ts';

describe('ajaxPromise', () => {
  it('should resolve to undefined', async () => {
    const result = await ajaxPromise({ url: 'https://example.com' });
    expect(result).toBeUndefined();
  });
});
