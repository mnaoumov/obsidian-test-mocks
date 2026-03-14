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
});
