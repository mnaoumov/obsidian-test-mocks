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
 * @returns The entry's value, stored verbatim - an entry explicitly holding `undefined` reads as `undefined` - or
 * `null` when the frontmatter has no such OWN key.
 */
export function parseFrontMatterEntry(frontmatter: unknown, key: RegExp | string): unknown {
  if (!frontmatter) {
    return null;
  }
  const fm = ensureGenericObject(frontmatter);
  if (typeof key === 'string') {
    return Object.hasOwn(fm, key) ? fm[key] : null;
  }
  for (const [fmKey, fmValue] of Object.entries(fm)) {
    if (key.test(fmKey)) {
      return fmValue;
    }
  }
  return null;
}
