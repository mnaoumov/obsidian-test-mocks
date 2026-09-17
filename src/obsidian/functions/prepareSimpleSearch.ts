/**
 * @file
 *
 * Mock of Obsidian's `prepareSimpleSearch`.
 */

import type { SearchResult as SearchResultOriginal } from 'obsidian';

/**
 * Builds a simple search callback for a query. Unlike Obsidian, which matches each space-separated word, the mock
 * looks for the whole query as one case-insensitive substring.
 *
 * @param query - The search query.
 * @returns A callback that searches a text, returning the first match's range and a score of minus its offset, or
 * `null` when the query is not found.
 */
export function prepareSimpleSearch(query: string): (text: string) => null | SearchResultOriginal {
  const lowerQuery = query.toLowerCase();

  return (text: string): null | SearchResultOriginal => {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    return index === -1
      ? null
      : {
        matches: [[index, index + query.length]],
        score: -index
      };
  };
}
