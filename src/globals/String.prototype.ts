/**
 * @file
 *
 * Mocks of the helper methods Obsidian adds to `String.prototype`, each called with the string as `this`.
 */

/**
 * Checks whether the string contains a substring, like `String.prototype.includes`.
 *
 * @param target - The substring to look for.
 * @returns `true` when the string contains `target`.
 */
export function contains(this: string, target: string): boolean {
  return this.includes(target);
}

/**
 * Fills numbered placeholders such as `{0}` with the matching argument.
 *
 * @param $arguments - The replacement values, by placeholder index; a placeholder without one becomes empty.
 * @returns The formatted string.
 */
export function format(this: string, ...$arguments: string[]): string {
  // Very small subset used in practice: "{0}" style formatting.
  return this.replaceAll(/\{(?<Index>\d+)\}/g, (_substring: string, index: number | string): string => {
    return $arguments[Number(index)] ?? '';
  });
}
