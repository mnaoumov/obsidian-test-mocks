import {
  describe,
  expect,
  it
} from 'vitest';

import { DurationValue } from '../../src/obsidian/DurationValue.ts';

describe('DurationValue', () => {
  it('should always be truthy', () => {
    const val = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(String(val)).toBe('');
  });
});
