import { ensureGenericObject } from '../../internal/type-guards.ts';

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
