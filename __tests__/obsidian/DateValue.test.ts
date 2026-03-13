import {
  describe,
  expect,
  it
} from 'vitest';

import { DateValue } from '../../src/obsidian/DateValue.ts';

describe('DateValue', () => {
  it('should always be truthy', () => {
    const val = new DateValue(new Date());
    expect(val.isTruthy()).toBe(true);
  });

  it('should return formatted date string', () => {
    const val = new DateValue(new Date());
    const str = String(val);
    expect(typeof str).toBe('string');
    expect(str.length).toBeGreaterThan(0);
  });
});
