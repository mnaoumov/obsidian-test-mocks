/**
 * @file
 *
 * Mocks of the static helpers Obsidian adds to the `Object` constructor.
 */

import type { MaybeReturn } from '../internal/types.ts';

/**
 * Iterates over an object's own enumerable string-keyed entries, stopping early when the callback returns `false`.
 *
 * @param object - The object to iterate over.
 * @param callback - Called with each value and its key; returning `false` stops the iteration.
 * @param context - The `this` value the callback is called with.
 * @returns `false` when the callback stopped the iteration, otherwise `true`.
 */
export function each(
  object: Record<string, unknown>,
  callback: (value: unknown, key?: string) => MaybeReturn<boolean>,
  context?: unknown
): boolean {
  for (const [key, value] of Object.entries(object)) {
    const result = callback.call(context, value, key);
    if (result === false) {
      return false;
    }
  }
  return true;
}

/**
 * Checks whether an object has no own enumerable string keys.
 *
 * @param object - The object to check.
 * @returns `true` when `object` has no keys.
 */
export function isEmpty(object: Record<string, unknown>): boolean {
  return Object.keys(object).length === 0;
}
