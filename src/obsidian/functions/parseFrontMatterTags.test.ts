import {
  describe,
  expect,
  it
} from 'vitest';

import { parseFrontMatterTags } from './parseFrontMatterTags.ts';

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

  it('should match the tags key case-insensitively', () => {
    expect(parseFrontMatterTags({ Tags: ['foo'] })).toEqual(['#foo']);
  });

  it('should not read a tag key', () => {
    expect(parseFrontMatterTags({ tag: 'fallback' })).toBeNull();
  });

  it('should trim every tag', () => {
    expect(parseFrontMatterTags({ tags: ['  foo  ', ' #bar '] })).toEqual(['#foo', '#bar']);
  });

  it('should drop a tag holding a space', () => {
    expect(parseFrontMatterTags({ tags: ['foo bar', 'baz'] })).toEqual(['#baz']);
  });

  it('should drop an entry that is empty once trimmed', () => {
    expect(parseFrontMatterTags({ tags: [' \t\n ', 'foo'] })).toEqual(['#foo']);
  });

  it('should filter non-string values from array', () => {
    const NON_STRING_VALUE = 42;
    expect(parseFrontMatterTags({ tags: ['a', NON_STRING_VALUE] })).toEqual(['#a']);
  });

  it('should return an empty array when every entry is dropped', () => {
    expect(parseFrontMatterTags({ tags: ['foo bar'] })).toEqual([]);
  });

  it('should return null for falsy frontmatter', () => {
    expect(parseFrontMatterTags(null)).toBeNull();
  });

  it('should return null when no tags key', () => {
    expect(parseFrontMatterTags({ title: 'x' })).toBeNull();
  });

  it('should return null when the tags entry is neither a string nor a list', () => {
    const NUMERIC_VALUE = 42;
    expect(parseFrontMatterTags({ tags: NUMERIC_VALUE })).toBeNull();
  });
});
