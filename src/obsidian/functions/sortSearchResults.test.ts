import type { SearchResultContainer } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { sortSearchResults } from './sortSearchResults.ts';

function makeResult(score: number): SearchResultContainer {
  return { match: { matches: [], score } };
}

const SCORE_LOW = 1;
const SCORE_MID = 3;
const SCORE_HIGH = 5;
const SCORE_SINGLE = 42;

describe('sortSearchResults', () => {
  it('should sort results by score in descending order', () => {
    const results = [makeResult(SCORE_LOW), makeResult(SCORE_HIGH), makeResult(SCORE_MID)];

    sortSearchResults(results);

    expect(results.map((r) => r.match.score)).toEqual([SCORE_HIGH, SCORE_MID, SCORE_LOW]);
  });

  it('should handle empty array', () => {
    const results: SearchResultContainer[] = [];

    sortSearchResults(results);

    expect(results).toEqual([]);
  });

  it('should handle single element', () => {
    const results = [makeResult(SCORE_SINGLE)];

    sortSearchResults(results);

    expect(results[0]?.match.score).toBe(SCORE_SINGLE);
  });

  it('should be stable for equal scores', () => {
    const a = makeResult(SCORE_MID);
    const b = makeResult(SCORE_MID);
    const results = [a, b];

    sortSearchResults(results);

    expect(results[0]).toBe(a);
    expect(results[1]).toBe(b);
  });
});
