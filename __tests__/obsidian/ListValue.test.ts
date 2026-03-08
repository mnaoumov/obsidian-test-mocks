import { describe, expect, it } from 'vitest';

import {
  ListValue,
  StringValue
} from 'obsidian';

describe('ListValue', () => {
  it('should default to empty values', () => {
    const val = new ListValue();
    expect(val.values).toEqual([]);
  });

  it('should be falsy when empty', () => {
    const val = new ListValue();
    expect(val.isTruthy()).toBe(false);
  });

  it('should be truthy when non-empty', () => {
    const val = new ListValue();
    val.values.push(new StringValue('item'));
    expect(val.isTruthy()).toBe(true);
  });

  it('should join values with comma-space for toString', () => {
    const val = new ListValue();
    val.values.push(new StringValue('a'), new StringValue('b'), new StringValue('c'));
    expect(val.toString()).toBe('a, b, c');
  });

  it('should return empty string for toString when empty', () => {
    const val = new ListValue();
    expect(val.toString()).toBe('');
  });
});
