import {
  describe,
  expect,
  it
} from 'vitest';

import { NumberValue } from '../../src/obsidian/NumberValue.ts';

const TEST_NUMBER = 7;

describe('NumberValue', () => {
  it('should default to 0', () => {
    const val = new NumberValue();
    expect(val.value__).toBe(0);
  });

  it('should accept a value', () => {
    const val = new NumberValue(TEST_NUMBER);
    expect(val.value__).toBe(TEST_NUMBER);
  });

  it('should return false for isTruthy when 0', () => {
    const val = new NumberValue(0);
    expect(val.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when non-zero', () => {
    const val = new NumberValue(1);
    expect(val.isTruthy()).toBe(true);
  });

  it('should convert to string', () => {
    const val = new NumberValue(TEST_NUMBER);
    expect(String(val)).toBe(String(TEST_NUMBER));
  });
});
