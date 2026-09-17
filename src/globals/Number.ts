/**
 * @file
 *
 * Mocks of the static helpers Obsidian adds to the `Number` constructor.
 */

/**
 * Type guard for numbers.
 *
 * @param object - The value to check.
 * @returns `true` when `object` is a number other than `NaN`.
 */
export function isNumber(object: unknown): object is number {
  return typeof object === 'number' && !Number.isNaN(object);
}
