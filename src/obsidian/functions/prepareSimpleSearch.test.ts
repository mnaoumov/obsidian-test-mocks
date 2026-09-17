import {
  describe,
  expect,
  it
} from 'vitest';

import { prepareSimpleSearch } from './prepareSimpleSearch.ts';

describe('prepareSimpleSearch', () => {
  it('should return a function', () => {
    const search = prepareSimpleSearch('abc');
    expect(typeof search).toBe('function');
  });

  it('should find a substring match', () => {
    const search = prepareSimpleSearch('world');
    const result = search('hello world');
    expect(result).not.toBeNull();
    expect(result?.matches).toHaveLength(1);
  });

  it('should return null when text does not contain query', () => {
    const search = prepareSimpleSearch('xyz');
    expect(search('hello')).toBeNull();
  });

  it('should be case insensitive', () => {
    const search = prepareSimpleSearch('HELLO');
    const result = search('hello world');
    expect(result).not.toBeNull();
  });

  it('should return correct match range', () => {
    const search = prepareSimpleSearch('lo');
    const result = search('hello');
    const MATCH_START = 3;
    const MATCH_END = 5;
    expect(result?.matches[0]).toEqual([MATCH_START, MATCH_END]);
  });

  it('should match space-separated words independently', () => {
    const search = prepareSimpleSearch('world hello');
    expect(search('hello big world')?.matches).toEqual([[0, 5], [10, 15]]);
  });

  it('should return null when any word is missing', () => {
    const search = prepareSimpleSearch('hello moon');
    expect(search('hello world')).toBeNull();
  });

  it('should collect every occurrence of a word', () => {
    const search = prepareSimpleSearch('ab');
    expect(search('ab ab')?.matches).toEqual([[0, 2], [3, 5]]);
  });

  it('should skip an occurrence starting right after the previous one', () => {
    const search = prepareSimpleSearch('ab');
    expect(search('abab')?.matches).toEqual([[0, 2]]);
  });

  it('should merge overlapping and touching matches', () => {
    const search = prepareSimpleSearch('abc bcd cde');
    expect(search('abcde')?.matches).toEqual([[0, 5]]);
  });

  it('should ignore empty words from repeated spaces', () => {
    const search = prepareSimpleSearch('a  b');
    expect(search('ab')?.matches).toEqual([[0, 2]]);
  });

  it('should score as Obsidian does', () => {
    const search = prepareSimpleSearch('world hello');
    const text = 'hello big world';
    const EXPECTED_SCORE = -1 - (15 + 1 - 11) / 100 - text.length / 10_000;
    expect(search(text)?.score).toBeCloseTo(EXPECTED_SCORE);
  });

  it('should return no matches and a zero score for an empty query', () => {
    const search = prepareSimpleSearch('');
    expect(search('anything')).toEqual({ matches: [], score: 0 });
  });
});
