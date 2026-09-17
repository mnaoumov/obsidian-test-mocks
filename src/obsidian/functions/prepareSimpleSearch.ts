/**
 * @file
 *
 * Mock of Obsidian's `prepareSimpleSearch`.
 */

import type { SearchResult as SearchResultOriginal } from 'obsidian';

type Range = [number, number];

/**
 * Builds a simple search callback for a query, as Obsidian does. The query is lowercased and split on spaces; every
 * non-empty word must occur in the text, case-insensitively, or the search fails. Every occurrence of every word is
 * a match, and overlapping or touching matches are merged.
 *
 * @param query - The search query.
 * @returns A callback that searches a text, returning the merged match ranges, sorted by start, and a score that
 * prefers fewer, tighter and earlier matches in shorter texts, or `null` when a word is missing.
 */
export function prepareSimpleSearch(query: string): (text: string) => null | SearchResultOriginal {
  const words = query.toLowerCase().split(' ');

  return (text: string): null | SearchResultOriginal => {
    const matches = findMatches(words, text);
    return matches
      ? {
        matches,
        score: getScore(matches, query.length, text.length)
      }
      : null;
  };
}

function findMatches(words: string[], text: string): null | Range[] {
  const lowerText = text.toLowerCase();
  const ranges: Range[] = [];
  for (const word of words) {
    if (!word) {
      continue;
    }
    let isFound = false;
    let index = lowerText.indexOf(word);
    while (index !== -1) {
      isFound = true;
      ranges.push([index, index + word.length]);
      index = lowerText.indexOf(word, index + word.length + 1);
    }
    if (!isFound) {
      return null;
    }
  }
  return mergeRanges(ranges);
}

function getScore(matches: Range[], queryLength: number, textLength: number): number {
  const [firstMatch] = matches;
  const lastMatch = matches.at(-1);
  if (!firstMatch || !lastMatch) {
    return 0;
  }
  const start = firstMatch[0];
  const SPAN_WEIGHT = 100;
  const START_WEIGHT = 1000;
  const LENGTH_WEIGHT = 10_000;
  return -(matches.length - 1)
    - (lastMatch[1] - start + 1 - queryLength) / SPAN_WEIGHT
    - start / START_WEIGHT
    - textLength / LENGTH_WEIGHT;
}

function mergeRanges(ranges: Range[]): Range[] {
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Range[] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range[0] <= last[1]) {
      last[1] = Math.max(last[1], range[1]);
    } else {
      merged.push(range);
    }
  }
  return merged;
}
