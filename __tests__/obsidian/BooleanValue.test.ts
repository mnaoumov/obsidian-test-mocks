import { describe, expect, it } from 'vitest';

import { BooleanValue } from 'obsidian';

describe('BooleanValue', () => {
  it('should default to false', () => {
    const val = new BooleanValue();
    expect(val.value).toBe(false);
  });

  it('should accept a value', () => {
    const val = new BooleanValue(true);
    expect(val.value).toBe(true);
  });

  it('should return false for isTruthy when false', () => {
    const val = new BooleanValue(false);
    expect(val.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when true', () => {
    const val = new BooleanValue(true);
    expect(val.isTruthy()).toBe(true);
  });

  it('should return "false" for toString when false', () => {
    const val = new BooleanValue(false);
    expect(val.toString()).toBe('false');
  });

  it('should return "true" for toString when true', () => {
    const val = new BooleanValue(true);
    expect(val.toString()).toBe('true');
  });
});
