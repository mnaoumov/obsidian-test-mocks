/**
 * @file
 *
 * Mock of Obsidian's global `isBoolean` type guard.
 */

/**
 * Type guard for booleans.
 *
 * @param object - The value to check.
 * @returns `true` when `object` is a primitive boolean.
 */
export function isBoolean(object: unknown): object is boolean {
  return typeof object === 'boolean';
}
