import type { TagValue as TagValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { TagValue } from '../../src/obsidian/TagValue.ts';

describe('TagValue', () => {
  it('should create an instance via create2__', () => {
    const val = TagValue.create2__('#test');
    expect(val).toBeInstanceOf(TagValue);
  });

  it('should store the tag value', () => {
    const val = new TagValue('#test');
    expect(val.value__).toBe('#test');
  });

  it('should return the tag for toString', () => {
    const val = new TagValue('#example');
    expect(String(val)).toBe('#example');
  });

  it('should be truthy for non-empty tags', () => {
    const val = new TagValue('#tag');
    expect(val.isTruthy()).toBe(true);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = TagValue.create2__('#tag');
      const original: TagValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});
