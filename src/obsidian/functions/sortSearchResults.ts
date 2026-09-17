/**
 * @file
 *
 * Mock of Obsidian's `sortSearchResults`.
 */

import type { SearchResultContainer as SearchResultContainerOriginal } from 'obsidian';

/**
 * Sorts search results in place, best match first. The mock orders them by descending `match.score`.
 *
 * @param results - The results to sort.
 */
export function sortSearchResults(results: SearchResultContainerOriginal[]): void {
  results.sort((a, b) => b.match.score - a.match.score);
}
