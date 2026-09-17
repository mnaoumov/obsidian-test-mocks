/**
 * @file
 *
 * Mock of Obsidian's `parseFrontMatterTags`.
 */

import { ensureGenericObject } from '../../internal/type-guards.ts';

/**
 * Reads a note's tags from its frontmatter. The mock reads the `tags` key, falling back to `tag`.
 *
 * @param frontmatter - The parsed frontmatter object, or a falsy value when the note has none.
 * @returns The tags, each prefixed with `#` (a single string becomes a one-element array, non-string list items are
 * dropped), or `null` when there are none.
 */
export function parseFrontMatterTags(frontmatter: unknown): null | string[] {
  if (!frontmatter) {
    return null;
  }
  const fm = ensureGenericObject(frontmatter);
  const raw = fm['tags'] ?? fm['tag'] ?? null;
  if (typeof raw === 'string') {
    return [raw.startsWith('#') ? raw : `#${raw}`];
  }
  return Array.isArray(raw)
    ? raw
      .filter((t): t is string => typeof t === 'string')
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
    : null;
}
