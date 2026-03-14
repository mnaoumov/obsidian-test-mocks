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
