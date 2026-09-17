/**
 * @file
 *
 * Mock of Obsidian's `renderMatches`.
 */

import type { SearchMatches as SearchMatchesOriginal } from 'obsidian';

import { noop } from '../../internal/noop.ts';

/**
 * Renders a text into an element with its search matches highlighted. A no-op in the mock.
 *
 * @param _el - The element or fragment to render into.
 * @param _text - The text to render.
 * @param _matches - The matched ranges to highlight, or `null` for none.
 * @param _offset - The offset to subtract from each match range.
 */
export function renderMatches(_el: DocumentFragment | HTMLElement, _text: string, _matches: null | SearchMatchesOriginal, _offset?: number): void {
  noop();
}
