import { describe, expect, it } from 'vitest';

import { NullValue } from 'obsidian';

describe('NullValue', () => {
  it('should return false for isTruthy', () => {
    const val = new NullValue();
    expect(val.isTruthy()).toBe(false);
  });

  it('should return empty string for toString', () => {
    const val = new NullValue();
    expect(val.toString()).toBe('');
  });
});
