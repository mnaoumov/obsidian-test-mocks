/**
 * @file
 *
 * Mocks of the helper methods Obsidian adds to `Array.prototype`, each called with the array as `this`.
 */

/**
 * Checks whether the array includes a value, like `Array.prototype.includes`.
 *
 * @typeParam T - The array's element type.
 * @param target - The value to look for.
 * @returns `true` when the array includes `target`.
 */
export function contains<T>(this: T[], target: T): boolean {
  return this.includes(target);
}

/**
 * Finds the index of the last element matching a predicate, scanning from the end.
 *
 * @typeParam T - The array's element type.
 * @param predicate - Called with each element; the scan stops at the first one it returns `true` for. `undefined`
 * elements are skipped without calling it.
 * @returns The index of the last matching element, or `-1` when none matches.
 */
export function findLastIndex<T>(
  this: T[],
  predicate: (value: T) => boolean
): number {
  for (let index = this.length - 1; index >= 0; index--) {
    const value = this[index];
    if (value !== undefined && predicate(value)) {
      return index;
    }
  }
  return -1;
}

/**
 * Gets the array's first element.
 *
 * @typeParam T - The array's element type.
 * @returns The first element, or `undefined` when the array is empty.
 */
export function first<T>(this: T[]): T | undefined {
  return this[0];
}

/**
 * Gets the array's last element.
 *
 * @typeParam T - The array's element type.
 * @returns The last element, or `undefined` when the array is empty.
 */
export function last<T>(this: T[]): T | undefined {
  return this.length > 0 ? this.at(-1) : undefined;
}

/**
 * Removes the first occurrence of a value from the array in place; does nothing when it is absent.
 *
 * @typeParam T - The array's element type.
 * @param target - The value to remove.
 */
export function remove<T>(this: T[], target: T): void {
  const index = this.indexOf(target);
  if (index !== -1) {
    this.splice(index, 1);
  }
}

/**
 * Shuffles the array in place. Obsidian shuffles randomly; the mock reverses the array instead, so tests stay
 * deterministic.
 *
 * @typeParam T - The array's element type.
 * @returns The same array, now reordered.
 */
export function shuffle<T>(this: T[]): T[] {
  // Deterministic shuffle for tests: reverse in-place.
  return this.reverse();
}

/**
 * Collects the array's distinct values, keeping the order of their first occurrence.
 *
 * @typeParam T - The array's element type.
 * @returns A new array without duplicates.
 */
export function unique<T>(this: T[]): T[] {
  return [...new Set(this)];
}
