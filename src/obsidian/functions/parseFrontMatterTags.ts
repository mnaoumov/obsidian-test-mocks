import { castTo } from '../../internal/cast.ts';

export function parseFrontMatterTags(frontmatter: unknown): null | string[] {
  if (!frontmatter) {
    return null;
  }
  const fm = castTo<Record<string, unknown>>(frontmatter);
  const raw = fm['tags'] ?? fm['tag'] ?? null;
  if (typeof raw === 'string') {
    return [raw.startsWith('#') ? raw : `#${raw}`];
  }
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === 'string')
      .map((t) => (t.startsWith('#') ? t : `#${t}`));
  }
  return null;
}
