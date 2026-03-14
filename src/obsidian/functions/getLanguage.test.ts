import {
  describe,
  expect,
  it
} from 'vitest';

import { getLanguage } from './getLanguage.ts';

describe('getLanguage', () => {
  it('should return en', () => {
    expect(getLanguage()).toBe('en');
  });
});
