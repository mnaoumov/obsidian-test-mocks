import {
  describe,
  expect,
  it
} from 'vitest';

import { StringValue } from '../../src/obsidian/StringValue.ts';

describe('StringValue', () => {
  it('should default to empty string', () => {
    const val = new StringValue();
    expect(val.value).toBe('');
  });

  it('should accept a value', () => {
    const val = new StringValue('hello');
    expect(val.value).toBe('hello');
  });

  it('should return false for isTruthy when empty', () => {
    const val = new StringValue('');
    expect(val.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when non-empty', () => {
    const val = new StringValue('hello');
    expect(val.isTruthy()).toBe(true);
  });

  it('should return the string for toString', () => {
    const val = new StringValue('hello');
    expect(String(val)).toBe('hello');
  });
});
