import {
  describe,
  expect,
  it
} from 'vitest';

import { RegExpValue } from '../../src/obsidian/RegExpValue.ts';

describe('RegExpValue', () => {
  it('should always be truthy', () => {
    const val = new RegExpValue();
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new RegExpValue();
    expect(String(val)).toBe('');
  });
});
