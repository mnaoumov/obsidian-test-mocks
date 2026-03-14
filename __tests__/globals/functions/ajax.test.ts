import {
  describe,
  expect,
  it
} from 'vitest';

import { ajax } from '../../../src/globals/functions/ajax.ts';

describe('ajax', () => {
  it('should not throw when called with valid options', () => {
    ajax({ url: 'https://example.com' });
    expect(true).toBe(true);
  });
});
