/**
 * @file
 *
 * Mock of Obsidian's `stripHeading`.
 */

/**
 * Normalizes a heading for link matching. Obsidian strips special characters and collapses spaces; the mock only
 * strips the leading `#` markers and the whitespace after them.
 *
 * @param heading - The heading text.
 * @returns The normalized heading.
 */
export function stripHeading(heading: string): string {
  return heading.replace(/^#+\s*/, '');
}
