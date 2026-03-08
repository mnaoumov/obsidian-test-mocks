import { describe, expect, it } from 'vitest';

import { DateValue } from 'obsidian';

describe('DateValue', () => {
  it('should have a moment value', () => {
    const val = new DateValue();
    expect(val.value).toBeDefined();
  });

  it('should always be truthy', () => {
    const val = new DateValue();
    expect(val.isTruthy()).toBe(true);
  });

  it('should return formatted date string', () => {
    const val = new DateValue();
    expect(typeof val.toString()).toBe('string');
    expect(val.toString().length).toBeGreaterThan(0);
  });
});
