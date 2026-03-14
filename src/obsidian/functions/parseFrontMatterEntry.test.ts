import {
  describe,
  expect,
  it
} from 'vitest';

import { parseFrontMatterEntry } from './parseFrontMatterEntry.ts';

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
