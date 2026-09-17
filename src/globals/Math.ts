/**
 * @file
 *
 * Mocks of the helpers Obsidian adds to the global `Math` object.
 */

/**
 * Restricts a number to a range.
 *
 * @param value - The number to restrict.
 * @param min - The lower bound.
 * @param max - The upper bound, which wins when `min` is greater than `max`.
 * @returns `value` when it lies within the range, otherwise the nearest bound.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Squares a number.
 *
 * @param value - The number to square.
 * @returns `value` multiplied by itself.
 */
export function square(value: number): number {
  return value * value;
}
