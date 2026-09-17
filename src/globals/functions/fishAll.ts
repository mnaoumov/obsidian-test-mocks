/**
 * @file
 *
 * Mock of Obsidian's global `fishAll` helper.
 */

/**
 * Finds every element in the global document matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The matching elements, in document order.
 */
export function fishAll(selector: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(selector)];
}
