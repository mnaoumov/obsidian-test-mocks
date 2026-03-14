import {
  describe,
  expect,
  it
} from 'vitest';

import { isNumber } from '../../src/globals/Number.ts';

const VALID_NUMBER = 42;
const NEGATIVE_DECIMAL = -3.14;

describe('Number.isNumber', () => {
  it('should return true for a valid number', () => {
    expect(isNumber(VALID_NUMBER)).toBe(true);
  });

  it('should return true for zero', () => {
    expect(isNumber(0)).toBe(true);
  });

  it('should return true for negative decimals', () => {
    expect(isNumber(NEGATIVE_DECIMAL)).toBe(true);
  });

  it('should return false for NaN', () => {
    expect(isNumber(NaN)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isNumber('hello')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isNumber(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNumber(undefined)).toBe(false);
  });
});
