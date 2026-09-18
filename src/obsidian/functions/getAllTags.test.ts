import type { CachedMetadata } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { getAllTags } from './getAllTags.ts';

describe('getAllTags', () => {
  it('should return inline tags', () => {
    const cache: CachedMetadata = {
      tags: [
        { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tag: '#foo' },
        { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tag: '#bar' }
      ]
    };
    const result = getAllTags(cache);
    expect(result).toEqual(['#foo', '#bar']);
  });

  it('should return frontmatter tags', () => {
    const cache: CachedMetadata = {
      frontmatter: { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tags: ['baz'] }
    };
    const result = getAllTags(cache);
    expect(result).toEqual(['#baz']);
  });

  it('should list the frontmatter tags before the inline ones', () => {
    const cache: CachedMetadata = {
      frontmatter: { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tags: ['fm'] },
      tags: [
        { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tag: '#inline' }
      ]
    };
    const result = getAllTags(cache);
    expect(result).toEqual(['#fm', '#inline']);
  });

  it('should keep a duplicate rather than deduplicating', () => {
    const cache: CachedMetadata = {
      frontmatter: { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tags: ['dup'] },
      tags: [
        { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tag: '#dup' }
      ]
    };
    expect(getAllTags(cache)).toEqual(['#dup', '#dup']);
  });

  it('should return an empty array when the cache has no tags', () => {
    expect(getAllTags({})).toEqual([]);
  });

  it('should return null for a falsy cache', () => {
    expect(getAllTags(null)).toBeNull();
  });
});
