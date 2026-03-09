import {
  describe,
  expect,
  it
} from 'vitest';

import { DateValue } from '../../src/obsidian/DateValue.ts';

describe('DateValue', () => {
  it('should have a moment value', () => {
    const val = new DateValue();
    expect(val.value__).toBeDefined();
  });

  it('should always be truthy', () => {
    const val = new DateValue();
    expect(val.isTruthy()).toBe(true);
  });

  it('should return formatted date string', () => {
    const val = new DateValue();
    const str = String(val);
    expect(typeof str).toBe('string');
    expect(str.length).toBeGreaterThan(0);
  });
});
