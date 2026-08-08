import type { TagValue as TagValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { TagValue } from './TagValue.ts';

describe('TagValue', () => {
  it('should create an instance via create2__', () => {
    const value = TagValue.create2__('#test');
    expect(value).toBeInstanceOf(TagValue);
  });

  it('should store the tag value', () => {
    const value = new TagValue('#test');
    expect(value.value__).toBe('#test');
  });

  it('should return the tag for toString', () => {
    const value = new TagValue('#example');
    expect(String(value)).toBe('#example');
  });

  it('should be truthy for non-empty tags', () => {
    const value = new TagValue('#tag');
    expect(value.isTruthy()).toBe(true);
  });

  describe('asOriginalType5__', () => {
    it('should return the same instance typed as the original', () => {
      const value = TagValue.create2__('#tag');
      const original: TagValueOriginal = value.asOriginalType5__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType5__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = TagValue.create2__('#tag');
      const mock = TagValue.fromOriginalType5__(value.asOriginalType5__());
      expect(mock).toBe(value);
    });
  });
});
