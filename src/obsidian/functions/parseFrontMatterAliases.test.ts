import {
  describe,
  expect,
  it
} from 'vitest';

import { parseFrontMatterAliases } from './parseFrontMatterAliases.ts';

describe('parseFrontMatterAliases', () => {
  it('should return aliases array', () => {
    expect(parseFrontMatterAliases({ aliases: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it('should return single alias as array', () => {
    expect(parseFrontMatterAliases({ aliases: 'single' })).toEqual(['single']);
  });

  it('should match the aliases key case-insensitively', () => {
    expect(parseFrontMatterAliases({ Aliases: ['a'] })).toEqual(['a']);
  });

  it('should not read an alias key', () => {
    expect(parseFrontMatterAliases({ alias: 'fallback' })).toBeNull();
  });

  it('should trim every alias', () => {
    expect(parseFrontMatterAliases({ aliases: ['  a  ', '\tb\n'] })).toEqual(['a', 'b']);
  });

  it('should trim a single alias', () => {
    expect(parseFrontMatterAliases({ aliases: '  single  ' })).toEqual(['single']);
  });

  it('should drop an entry that is empty once trimmed', () => {
    expect(parseFrontMatterAliases({ aliases: [' \t\n ', 'a'] })).toEqual(['a']);
  });

  it('should filter non-string values from array', () => {
    const NON_STRING_VALUE = 123;
    expect(parseFrontMatterAliases({ aliases: ['a', NON_STRING_VALUE, 'b'] })).toEqual(['a', 'b']);
  });

  it('should return an empty array when every entry is dropped', () => {
    expect(parseFrontMatterAliases({ aliases: ['\t'] })).toEqual([]);
  });

  it('should return null for falsy frontmatter', () => {
    expect(parseFrontMatterAliases(null)).toBeNull();
  });

  it('should return null when no aliases key', () => {
    expect(parseFrontMatterAliases({ title: 'x' })).toBeNull();
  });

  it('should return null for an empty aliases entry', () => {
    expect(parseFrontMatterAliases({ aliases: '' })).toBeNull();
  });

  it('should return null when the aliases entry is neither a string nor a list', () => {
    const NUMERIC_VALUE = 42;
    expect(parseFrontMatterAliases({ aliases: NUMERIC_VALUE })).toBeNull();
  });
});
