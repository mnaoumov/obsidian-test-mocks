import type { SearchResult as SearchResultOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';

export function renderResults(_el: HTMLElement, _text: string, _result: SearchResultOriginal, _offset?: number): void {
  noop();
}
