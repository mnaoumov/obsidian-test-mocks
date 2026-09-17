/**
 * @file
 *
 * Mock of Obsidian's `parseFrontMatterStringArray`.
 */

import { parseFrontMatterEntry } from './parseFrontMatterEntry.ts';

/**
 * Reads a frontmatter entry as a list of strings.
 *
 * @param frontmatter - The parsed frontmatter object, or a falsy value when the note has none.
 * @param key - The exact key, or a pattern matched against every key.
 * @returns The strings (a single string becomes a one-element array, non-string list items are dropped), or `null`
 * when the entry is missing or neither a string nor a list.
 */
export function parseFrontMatterStringArray(frontmatter: unknown, key: RegExp | string): null | string[] {
  const entry = parseFrontMatterEntry(frontmatter, key);
  if (typeof entry === 'string') {
    return [entry];
  }
  return Array.isArray(entry) ? entry.filter((item): item is string => typeof item === 'string') : null;
}
