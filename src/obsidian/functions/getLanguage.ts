/**
 * @file
 *
 * Mock of Obsidian's `getLanguage`.
 */

/**
 * Gets the ISO code of the app's configured interface language. The mock always answers English.
 *
 * @returns `'en'`.
 */
export function getLanguage(): string {
  return 'en';
}
