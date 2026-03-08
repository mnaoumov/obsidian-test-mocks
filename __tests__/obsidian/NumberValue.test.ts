import { describe, expect, it } from 'vitest';

import { NumberValue } from 'obsidian';

describe('NumberValue', () => {
  it('should default to 0', () => {
    const val = new NumberValue();
    expect(val.value).toBe(0);
  });

  it('should accept a value', () => {
    const val = new NumberValue(42);
    expect(val.value).toBe(42);
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
    const val = new NumberValue(42);
    expect(val.toString()).toBe('42');
  });
});
