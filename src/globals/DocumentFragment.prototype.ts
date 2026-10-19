/**
 * @file
 *
 * Mocks of the element lookup helpers Obsidian adds to `DocumentFragment.prototype`.
 */

/**
 * Finds the first descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The first matching element, or
ull when nothing matches.
 */
export function find(this: DocumentFragment, selector: string): HTMLElement | null {
  return this.querySelector<HTMLElement>(selector);
}

/**
 * Finds every descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The matching elements, in document order.
 */
export function findAll(this: DocumentFragment, selector: string): HTMLElement[] {
  return [...this.querySelectorAll<HTMLElement>(selector)];
}
