import {
  describe,
  expect,
  it
} from 'vitest';

import { ListValue } from '../../src/obsidian/ListValue.ts';
import { StringValue } from '../../src/obsidian/StringValue.ts';

describe('ListValue', () => {
  it('should default to empty values', () => {
    const val = new ListValue();
    expect(val.values__).toEqual([]);
  });

  it('should be falsy when empty', () => {
    const val = new ListValue();
    expect(val.isTruthy()).toBe(false);
  });

  it('should be truthy when non-empty', () => {
    const val = new ListValue();
    val.values__.push(new StringValue('item'));
    expect(val.isTruthy()).toBe(true);
  });

  it('should join values with comma-space for toString', () => {
    const val = new ListValue();
    val.values__.push(new StringValue('a'), new StringValue('b'), new StringValue('c'));
    expect(String(val)).toBe('a, b, c');
  });

  it('should return empty string for toString when empty', () => {
    const val = new ListValue();
    expect(String(val)).toBe('');
  });
});
