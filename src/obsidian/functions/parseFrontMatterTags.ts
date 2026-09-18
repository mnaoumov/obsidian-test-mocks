/**
 * @file
 *
 * Mock of Obsidian's `parseFrontMatterTags`.
 */

import { parseFrontMatterStringArray } from './parseFrontMatterStringArray.ts';

/**
 * Reads a note's tags from its frontmatter. Only a `tags` key is read, case-insensitively; Obsidian reads no
 * `tag` fallback.
 *
 * @param frontmatter - The parsed frontmatter object, or a falsy value when the note has none.
 * @returns The tags, each trimmed and prefixed with `#` (a single string becomes a one-element array,
 * non-string list items are dropped, and so is every empty entry and every entry holding a space, which is
 * not a tag). An entry-less list yields an empty array; `null` means there is no `tags` entry at all, or it
 * is neither a string nor a list.
 */
export function parseFrontMatterTags(frontmatter: unknown): null | string[] {
  if (!frontmatter) {
    return null;
  }
  const tags = parseFrontMatterStringArray(frontmatter, /^tags$/i);
  return tags
    ? tags
      .filter((tag) => !!tag && !tag.includes(' '))
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
    : null;
}
