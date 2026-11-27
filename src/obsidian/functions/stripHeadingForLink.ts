/**
 * @file
 *
 * Mock of Obsidian's `stripHeadingForLink`.
 */

/**
 * The characters and pairs Obsidian replaces with a space: `:`, `#`, `|`, `^`, `\`, a line break, `%%`, `[[` and `]]`.
 * A lone `[` or `]` is kept.
 */
const LINK_BREAKING_SEQUENCE_REGEXP = /(?:[:#|^\\\r\n]|%%|\[\[|\]\])/g;

/**
 * Prepares a heading for use in a link by removing characters that would break it. A port of Obsidian's own (read in
 * Obsidian 1.15.1's `app.js`): every `:`, `#`, `|`, `^`, `\`, line break, `%%`, `[[` and `]]` becomes a space, each
 * run of whitespace collapses to one space, and the result is trimmed. So `foo:#|^\\\r\n%%[[]]bar` reads `foo bar`, and
 * a lone `[` or `]` is kept.
 *
 * @param heading - The heading text.
 * @returns The heading, safe to use as a link subpath.
 */
export function stripHeadingForLink(heading: string): string {
  return heading.replaceAll(LINK_BREAKING_SEQUENCE_REGEXP, ' ').replaceAll(/\s+/g, ' ').trim();
}
