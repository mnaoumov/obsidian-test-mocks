import {
  describe,
  expect,
  it
} from 'vitest';

import { isString } from './String.ts';

describe('String.isString', () => {
  it('should return true for a string', () => {
    expect(isString('hello')).toBe(true);
  });

  it('should return true for empty string', () => {
    expect(isString('')).toBe(true);
  });

  it('should return false for a number', () => {
    expect(isString(0)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isString(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isString(undefined)).toBe(false);
  });
});
