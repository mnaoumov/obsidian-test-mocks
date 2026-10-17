/**
 * @file
 *
 * Mock of Obsidian's `normalizePath`.
 */

const NON_BREAKING_SPACE_REGEXP = /\u{A0}|\u{202F}/gu;

/**
 * Normalizes a path so it can be used with the vault, exactly as Obsidian's own does: backslashes and runs of
 * slashes become a single `/`, leading and trailing slashes are stripped, a path left empty becomes the root `/`,
 * a no-break space (U+00A0) or a narrow no-break space (U+202F) becomes a plain space, and the result is put in
 * Unicode normalization form NFC.
 *
 * @param path - The path to normalize.
 * @returns The normalized path.
 */
export function normalizePath(path: string): string {
  let normalized = path.replaceAll(/[\\/]+/g, '/').replaceAll(/^\/+|\/+$/g, '');
  if (normalized === '') {
    normalized = '/';
  }

  return normalized.replaceAll(NON_BREAKING_SPACE_REGEXP, ' ').normalize('NFC');
}
