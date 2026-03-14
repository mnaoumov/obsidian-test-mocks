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

  it('should combine inline and frontmatter tags', () => {
    const cache: CachedMetadata = {
      frontmatter: { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tags: ['fm'] },
      tags: [
        { position: { end: { col: 0, line: 0, offset: 0 }, start: { col: 0, line: 0, offset: 0 } }, tag: '#inline' }
      ]
    };
    const result = getAllTags(cache);
    expect(result).toEqual(['#inline', '#fm']);
  });

  it('should return null when no tags', () => {
    expect(getAllTags({})).toBeNull();
  });
});
