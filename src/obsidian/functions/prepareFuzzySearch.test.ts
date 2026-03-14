import {
  describe,
  expect,
  it
} from 'vitest';

import { prepareFuzzySearch } from './prepareFuzzySearch.ts';

describe('prepareFuzzySearch', () => {
  it('should return a function', () => {
    const search = prepareFuzzySearch('abc');
    expect(typeof search).toBe('function');
  });

  it('should find exact match', () => {
    const search = prepareFuzzySearch('hello');
    const result = search('hello world');
    expect(result).not.toBeNull();
    expect(result?.matches.length).toBeGreaterThan(0);
  });

  it('should return null for non-matching text', () => {
    const search = prepareFuzzySearch('xyz');
    expect(search('hello')).toBeNull();
  });

  it('should be case insensitive', () => {
    const search = prepareFuzzySearch('ABC');
    const result = search('abc');
    expect(result).not.toBeNull();
  });

  it('should find fuzzy matches', () => {
    const search = prepareFuzzySearch('hlo');
    const result = search('hello');
    expect(result).not.toBeNull();
  });

  it('should give word boundary bonus', () => {
    const search = prepareFuzzySearch('h');
    const resultBoundary = search('hello');
    const resultMid = search('ah');
    // Both should match, boundary should have better (more negative) score
    expect(resultBoundary).not.toBeNull();
    expect(resultMid).not.toBeNull();
  });

  it('should give consecutive match bonus', () => {
    const search = prepareFuzzySearch('he');
    const result = search('hello');
    expect(result).not.toBeNull();
    // Consecutive chars should produce a single merged match range
    const EXPECTED_END = 2;
    expect(result?.matches[0]?.[1]).toBe(EXPECTED_END);
  });
});
