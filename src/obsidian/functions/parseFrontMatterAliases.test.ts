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
