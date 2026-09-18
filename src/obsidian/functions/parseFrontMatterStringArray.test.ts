import {
  describe,
  expect,
  it
} from 'vitest';

import { parseFrontMatterStringArray } from './parseFrontMatterStringArray.ts';

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

  it('should trim every entry of an array', () => {
    expect(parseFrontMatterStringArray({ items: ['  a  ', '\tb\n'] }, 'items')).toEqual(['a', 'b']);
  });

  it('should trim a single string entry', () => {
    expect(parseFrontMatterStringArray({ key: '  value  ' }, 'key')).toEqual(['value']);
  });

  it('should return null for an empty string entry', () => {
    expect(parseFrontMatterStringArray({ key: '' }, 'key')).toBeNull();
  });

  it('should return an empty array for an entry-less list', () => {
    expect(parseFrontMatterStringArray({ items: [] }, 'items')).toEqual([]);
  });
});
