import {
  describe,
  expect,
  it
} from 'vitest';

import { parseFrontMatterAliases } from '../../../src/obsidian/functions/parseFrontMatterAliases.ts';
import { parseFrontMatterEntry } from '../../../src/obsidian/functions/parseFrontMatterEntry.ts';
import { parseFrontMatterStringArray } from '../../../src/obsidian/functions/parseFrontMatterStringArray.ts';
import { parseFrontMatterTags } from '../../../src/obsidian/functions/parseFrontMatterTags.ts';

describe('parseFrontMatterEntry', () => {
  it('should return value for a string key', () => {
    expect(parseFrontMatterEntry({ title: 'Hello' }, 'title')).toBe('Hello');
  });

  it('should return null for missing key', () => {
    expect(parseFrontMatterEntry({ title: 'Hello' }, 'missing')).toBeNull();
  });

  it('should match a RegExp key', () => {
    expect(parseFrontMatterEntry({ tags: ['a'] }, /tag/)).toEqual(['a']);
  });

  it('should return null when no RegExp match', () => {
    expect(parseFrontMatterEntry({ title: 'x' }, /zzz/)).toBeNull();
  });

  it('should return null for falsy frontmatter', () => {
    expect(parseFrontMatterEntry(null, 'key')).toBeNull();
  });

  it('should return null for undefined frontmatter', () => {
    expect(parseFrontMatterEntry(undefined, 'key')).toBeNull();
  });
});

describe('parseFrontMatterAliases', () => {
  it('should return aliases array', () => {
    expect(parseFrontMatterAliases({ aliases: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it('should return single alias as array', () => {
    expect(parseFrontMatterAliases({ aliases: 'single' })).toEqual(['single']);
  });

  it('should use alias key as fallback', () => {
    expect(parseFrontMatterAliases({ alias: 'fallback' })).toEqual(['fallback']);
  });

  it('should filter non-string values from array', () => {
    const NON_STRING_VALUE = 123;
    expect(parseFrontMatterAliases({ aliases: ['a', NON_STRING_VALUE, 'b'] })).toEqual(['a', 'b']);
  });

  it('should return null for falsy frontmatter', () => {
    expect(parseFrontMatterAliases(null)).toBeNull();
  });

  it('should return null when no aliases key', () => {
    expect(parseFrontMatterAliases({ title: 'x' })).toBeNull();
  });
});

describe('parseFrontMatterTags', () => {
  it('should return tags with hash prefix', () => {
    expect(parseFrontMatterTags({ tags: ['foo', 'bar'] })).toEqual(['#foo', '#bar']);
  });

  it('should preserve existing hash prefix', () => {
    expect(parseFrontMatterTags({ tags: ['#already'] })).toEqual(['#already']);
  });

  it('should handle a single string tag', () => {
    expect(parseFrontMatterTags({ tags: 'solo' })).toEqual(['#solo']);
  });

  it('should preserve hash prefix for a single string tag', () => {
    expect(parseFrontMatterTags({ tags: '#prefixed' })).toEqual(['#prefixed']);
  });

  it('should use tag key as fallback', () => {
    expect(parseFrontMatterTags({ tag: 'fallback' })).toEqual(['#fallback']);
  });

  it('should filter non-string values from array', () => {
    const NON_STRING_VALUE = 42;
    expect(parseFrontMatterTags({ tags: ['a', NON_STRING_VALUE] })).toEqual(['#a']);
  });

  it('should return null for falsy frontmatter', () => {
    expect(parseFrontMatterTags(null)).toBeNull();
  });

  it('should return null when no tags key', () => {
    expect(parseFrontMatterTags({ title: 'x' })).toBeNull();
  });
});

describe('parseFrontMatterStringArray', () => {
  it('should return string array for string key', () => {
    expect(parseFrontMatterStringArray({ items: ['a', 'b'] }, 'items')).toEqual(['a', 'b']);
  });

  it('should wrap single string in array', () => {
    expect(parseFrontMatterStringArray({ key: 'value' }, 'key')).toEqual(['value']);
  });

  it('should return null when entry is not string or array', () => {
    const NUMERIC_VALUE = 42;
    expect(parseFrontMatterStringArray({ key: NUMERIC_VALUE }, 'key')).toBeNull();
  });

  it('should return null for null frontmatter', () => {
    expect(parseFrontMatterStringArray(null, 'key')).toBeNull();
  });

  it('should filter non-string values from array', () => {
    expect(parseFrontMatterStringArray({ items: ['a', 1, 'b'] }, 'items')).toEqual(['a', 'b']);
  });
});
