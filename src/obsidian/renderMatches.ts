import type { SearchMatches as SearchMatchesOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';

export function renderMatches(_el: DocumentFragment | HTMLElement, _text: string, _matches: null | SearchMatchesOriginal, _offset?: number): void {
  noop();
}
