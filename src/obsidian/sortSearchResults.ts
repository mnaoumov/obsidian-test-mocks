import type { SearchResultContainer as SearchResultContainerOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';

export function sortSearchResults(_results: SearchResultContainerOriginal[]): void {
  noop();
}
