/**
 * @file
 *
 * Mock of Obsidian's global `createSpan` helper.
 */

import { createEl } from './createEl.ts';

/**
 * Creates a `<span>`, as {@link createEl} does.
 *
 * @param o - A class name, or the element's options.
 * @param callback - Called with the new element before it is returned.
 * @returns The new `<span>`.
 */
export function createSpan(
  o?: DomElementInfo | string,
  callback?: (el: HTMLSpanElement) => void
): HTMLSpanElement {
  return createEl('span', o, callback);
}
