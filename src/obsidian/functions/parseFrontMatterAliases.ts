/**
 * @file
 *
 * Mock of Obsidian's `parseFrontMatterAliases`.
 */

import { parseFrontMatterStringArray } from './parseFrontMatterStringArray.ts';

/**
 * Reads a note's aliases from its frontmatter. Only an `aliases` key is read, case-insensitively; Obsidian reads
 * no `alias` fallback.
 *
 * @param frontmatter - The parsed frontmatter object, or a falsy value when the note has none.
 * @returns The aliases, each trimmed (a single string becomes a one-element array, non-string list items are
 * dropped, and so is every entry that is empty once trimmed). An entry-less list yields an empty array; `null`
 * means there is no `aliases` entry at all, or it is neither a string nor a list.
 */
export function parseFrontMatterAliases(frontmatter: unknown): null | string[] {
  const aliases = parseFrontMatterStringArray(frontmatter, /^aliases$/i);
  return aliases ? aliases.filter((alias) => !!alias) : null;
}
