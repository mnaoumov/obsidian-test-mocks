/**
 * @file
 *
 * Mock of Obsidian's `renderResults`.
 */

import type { SearchResult as SearchResultOriginal } from 'obsidian';

import { noop } from '../../internal/noop.ts';

/**
 * Renders a text into an element with the matches of a search result highlighted. A no-op in the mock.
 *
 * @param _el - The element to render into.
 * @param _text - The text to render.
 * @param _result - The search result whose matches to highlight.
 * @param _offset - The offset to subtract from each match range.
 */
export function renderResults(_el: HTMLElement, _text: string, _result: SearchResultOriginal, _offset?: number): void {
  noop();
}
