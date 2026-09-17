/**
 * @file
 *
 * Mock of Obsidian's `prepareFuzzySearch`.
 */

import type { SearchResult as SearchResultOriginal } from 'obsidian';

import { ensureNonNullable } from '../../internal/type-guards.ts';

const CONSECUTIVE_MATCH_SCORE = 2;
const WORD_BOUNDARY_SCORE = 3;
const INITIAL_LAST_MATCH_INDEX = -2;

/**
 * Builds a fuzzy search callback for a query. The mock's own scoring matches the query's characters in order,
 * ignoring case, and rewards consecutive matches and matches at word boundaries; its scores are not Obsidian's.
 *
 * @param query - The fuzzy query.
 * @returns A callback that searches a text, returning the matched ranges and a score (negative, lower for better
 * matches), or `null` when not every query character is found in order.
 */
export function prepareFuzzySearch(query: string): (text: string) => null | SearchResultOriginal {
  const lowerQuery = query.toLowerCase();

  return (text: string): null | SearchResultOriginal => {
    const lowerText = text.toLowerCase();
    const matches: [number, number][] = [];
    let queryIndex = 0;
    let score = 0;
    let lastMatchIndex = INITIAL_LAST_MATCH_INDEX;

    for (let index = 0; index < lowerText.length && queryIndex < lowerQuery.length; index++) {
      if (lowerText[index] !== lowerQuery[queryIndex]) {
        continue;
      }

      const isConsecutive = index === lastMatchIndex + 1;

      if (isConsecutive && matches.length > 0) {
        const lastMatch = ensureNonNullable(matches.at(-1));
        lastMatch[1] = index + 1;
        score += CONSECUTIVE_MATCH_SCORE;
      } else {
        matches.push([index, index + 1]);
        score += 1;
      }

      if (index === 0 || text[index - 1] === ' ' || text[index - 1] === '/' || text[index - 1] === '-' || text[index - 1] === '_') {
        score += WORD_BOUNDARY_SCORE;
      }

      lastMatchIndex = index;
      queryIndex++;
    }

    if (queryIndex < lowerQuery.length) {
      return null;
    }

    score = -score;

    return { matches, score };
  };
}
