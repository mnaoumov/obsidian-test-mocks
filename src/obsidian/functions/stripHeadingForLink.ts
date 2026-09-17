/**
 * @file
 *
 * Mock of Obsidian's `stripHeadingForLink`.
 */

/**
 * Prepares a heading for use in a link by removing characters that would break it. The mock strips the leading `#`
 * markers and the whitespace after them, then removes every `[`, `]`, `|`, `#`, `^` and `\`.
 *
 * @param heading - The heading text.
 * @returns The heading, safe to use as a link subpath.
 */
export function stripHeadingForLink(heading: string): string {
  return heading.replace(/^#+\s*/, '').replaceAll(/[[\]|#^\\]/g, '');
}
