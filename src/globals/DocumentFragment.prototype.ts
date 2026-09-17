/**
 * @file
 *
 * Mocks of the element lookup helpers Obsidian adds to `DocumentFragment.prototype`.
 */

import { ensureNonNullable } from '../internal/type-guards.ts';

/**
 * Finds the first descendant matching a selector.
 *
 * @param selector - The CSS selector to match.
 * @returns The first matching element. The mock throws when nothing matches.
 */
export function find(this: DocumentFragment, selector: string): HTMLElement {
  return ensureNonNullable(this.querySelector(selector));
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
