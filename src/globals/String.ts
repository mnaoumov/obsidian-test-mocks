/**
 * @file
 *
 * Mocks of the static helpers Obsidian adds to the `String` constructor.
 */

/**
 * Type guard for strings.
 *
 * @param object - The value to check.
 * @returns `true` when `object` is a primitive string.
 */
export function isString(object: unknown): object is string {
  return typeof object === 'string';
}
