/**
 * @file
 *
 * Mock of Obsidian's `getLinkpath`.
 */

import { ensureNonNullable } from '../../internal/type-guards.ts';

/**
 * Converts link text to a link path by dropping any `#heading` or `#^block` subpath.
 *
 * @param linktext - The text of a wikilink, without the surrounding `[[` and `]]`.
 * @returns The path of the linked file: everything before the first `#`.
 */
export function getLinkpath(linktext: string): string {
  return ensureNonNullable(linktext.split('#', 1)[0]);
}
