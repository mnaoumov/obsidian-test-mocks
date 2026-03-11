import { castTo } from '../../internal/cast.ts';

export function parseFrontMatterEntry(frontmatter: unknown, key: RegExp | string): unknown {
  if (!frontmatter) {
    return null;
  }
  const fm = castTo<Record<string, unknown>>(frontmatter);
  if (typeof key === 'string') {
    return fm[key] ?? null;
  }
  for (const [k, v] of Object.entries(fm)) {
    if (key.test(k)) {
      return v;
    }
  }
  return null;
}
