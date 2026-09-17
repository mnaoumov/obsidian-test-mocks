/**
 * @file
 *
 * Mock of Obsidian's `parseFrontMatterEntry`.
 */

import { ensureGenericObject } from '../../internal/type-guards.ts';

/**
 * Reads one entry from a note's frontmatter.
 *
 * @param frontmatter - The parsed frontmatter object, or a falsy value when the note has none.
 * @param key - The exact key, or a pattern matched against every key, in which case the first matching entry wins.
 * @returns The entry's value, or `null` when there is no such entry.
 */
export function parseFrontMatterEntry(frontmatter: unknown, key: RegExp | string): unknown {
  if (!frontmatter) {
    return null;
  }
  const fm = ensureGenericObject(frontmatter);
  if (typeof key === 'string') {
    return fm[key] ?? null;
  }
  for (const [fmKey, fmValue] of Object.entries(fm)) {
    if (key.test(fmKey)) {
      return fmValue;
    }
  }
  return null;
}
