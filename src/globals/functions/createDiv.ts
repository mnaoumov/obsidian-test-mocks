/**
 * @file
 *
 * Mock of Obsidian's global `createDiv` helper.
 */

import { createEl } from './createEl.ts';

/**
 * Creates a `<div>`, as {@link createEl} does.
 *
 * @param o - A class name, or the element's options.
 * @param callback - Called with the new element before it is returned.
 * @returns The new `<div>`.
 */
export function createDiv(
  o?: DomElementInfo | string,
  callback?: (el: HTMLDivElement) => void
): HTMLDivElement {
  return createEl('div', o, callback);
}
