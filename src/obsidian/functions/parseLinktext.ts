/**
 * @file
 *
 * Mock of Obsidian's `parseLinktext`.
 */

import type { ParsedLinktext } from '../../internal/types.ts';

/**
 * Splits the text of a wikilink into the linked file path and the subpath, which names a heading or a block.
 *
 * @param linktext - The text of a wikilink, without the surrounding `[[` and `]]`.
 * @returns The part before the first `#` as `path`, and the rest, `#` included, as `subpath` (empty when there is no
 * `#`).
 */
export function parseLinktext(linktext: string): ParsedLinktext {
  const hashIndex = linktext.indexOf('#');
  return hashIndex === -1 ? { path: linktext, subpath: '' } : { path: linktext.slice(0, hashIndex), subpath: linktext.slice(hashIndex) };
}
