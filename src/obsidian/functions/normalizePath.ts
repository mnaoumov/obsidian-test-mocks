/**
 * @file
 *
 * Mock of Obsidian's `normalizePath`.
 */

/**
 * Normalizes a path so it can be used with the vault. The mock only turns backslashes into forward slashes,
 * collapses repeated slashes and strips a leading or trailing slash.
 *
 * @param path - The path to normalize.
 * @returns The normalized path.
 */
export function normalizePath(path: string): string {
  return path.replaceAll('\\', '/').replaceAll(/\/+/g, '/').replaceAll(/^\/|\/$/g, '');
}
