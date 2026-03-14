import {
  describe,
  expect,
  it
} from 'vitest';

import { isBoolean } from './isBoolean.ts';

describe('isBoolean', () => {
  it('should return true for true', () => {
    expect(isBoolean(true)).toBe(true);
  });

  it('should return true for false', () => {
    expect(isBoolean(false)).toBe(true);
  });

  it('should return false for a number', () => {
    expect(isBoolean(0)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isBoolean('true')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isBoolean(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isBoolean(undefined)).toBe(false);
  });
});
