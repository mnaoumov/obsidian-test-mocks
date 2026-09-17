/**
 * @file
 *
 * Mocks of the static helpers Obsidian adds to the `Array` constructor.
 */

/**
 * Concatenates several arrays into one.
 *
 * @typeParam T - The element type.
 * @param arrays - The arrays to join, in order.
 * @returns A new array holding every element of `arrays`.
 */
export function combine<T>(arrays: T[][]): T[] {
  return arrays.flat();
}
