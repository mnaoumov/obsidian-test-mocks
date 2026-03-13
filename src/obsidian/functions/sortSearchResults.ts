import type { SearchResultContainer as SearchResultContainerOriginal } from 'obsidian';

export function sortSearchResults(results: SearchResultContainerOriginal[]): void {
  results.sort((a, b) => b.match.score - a.match.score);
}
