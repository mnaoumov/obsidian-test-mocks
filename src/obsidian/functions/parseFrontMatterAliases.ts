/**
 * @file
 *
 * Mock of Obsidian's `parseFrontMatterAliases`.
 */

import { ensureGenericObject } from '../../internal/type-guards.ts';

/**
 * Reads a note's aliases from its frontmatter. The mock reads the `aliases` key, falling back to `alias`.
 *
 * @param frontmatter - The parsed frontmatter object, or a falsy value when the note has none.
 * @returns The aliases (a single string becomes a one-element array, non-string list items are dropped), or `null`
 * when there are none.
 */
export function parseFrontMatterAliases(frontmatter: unknown): null | string[] {
  if (!frontmatter) {
    return null;
  }
  const fm = ensureGenericObject(frontmatter);
  const aliases = fm['aliases'] ?? fm['alias'] ?? null;
  if (typeof aliases === 'string') {
    return [aliases];
  }
  return Array.isArray(aliases) ? aliases.filter((a): a is string => typeof a === 'string') : null;
}
