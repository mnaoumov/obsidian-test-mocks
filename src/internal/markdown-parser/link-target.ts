/**
 * @file
 *
 * The three transforms Obsidian applies to a link target, shared by the places that ask for them: the markdown
 * parser's frontmatter link reader, `App.fixFileLinks` and `ImageValue.renderTo`.
 */

/**
 * The non-breaking space Obsidian folds back into an ordinary one before resolving a target.
 */
const NON_BREAKING_SPACE_REGEX = /\u{A0}/gu;

/**
 * Decodes a percent-encoded link target, keeping it as it is when it is not decodable.
 *
 * @param target - The link target.
 * @returns The decoded target, or `target` itself when `decodeURI` throws on it.
 */
export function decodeUriSafely(target: string): string {
  try {
    return decodeURI(target);
  } catch {
    return target;
  }
}

/**
 * Tells whether a link target points inside the vault rather than out of it, as Obsidian's own test does: an
 * explicitly relative target always does, and any other one does unless it carries a `:`, which is what
 * excludes `https://`, `mailto:` and the rest.
 *
 * @param target - The link target.
 * @returns Whether it is internal.
 */
export function isInternalLinkTarget(target: string): boolean {
  return target.startsWith('./') || target.startsWith('../') || !target.includes(':');
}

/**
 * Normalizes a link target the way Obsidian does before resolving it: every non-breaking space becomes an
 * ordinary one, the result is trimmed, and it is normalized to Unicode NFC.
 *
 * @param target - The link target.
 * @returns The normalized target.
 */
export function normalizeLinkTarget(target: string): string {
  return target.replaceAll(NON_BREAKING_SPACE_REGEX, ' ').trim().normalize('NFC');
}
