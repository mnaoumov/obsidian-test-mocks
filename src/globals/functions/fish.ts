/**
 * @file
 *
 * Mock of Obsidian's global `fish` helper.
 */

/**
 * Finds the first element in the global document matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The first matching element, or `null` when nothing matches.
 */
export function fish(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}
