import {
  describe,
  expect,
  it
} from 'vitest';

import { TagValue } from '../../src/obsidian/TagValue.ts';

describe('TagValue', () => {
  it('should store the tag value', () => {
    const val = new TagValue('#test');
    expect(val.value).toBe('#test');
  });

  it('should return the tag for toString', () => {
    const val = new TagValue('#example');
    expect(String(val)).toBe('#example');
  });

  it('should be truthy for non-empty tags', () => {
    const val = new TagValue('#tag');
    expect(val.isTruthy()).toBe(true);
  });
});
