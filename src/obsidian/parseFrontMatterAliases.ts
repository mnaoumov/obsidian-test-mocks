import { castTo } from '../internal/cast.ts';

export function parseFrontMatterAliases(frontmatter: unknown): null | string[] {
  if (!frontmatter) {
    return null;
  }
  const fm = castTo<Record<string, unknown>>(frontmatter);
  const aliases = fm['aliases'] ?? fm['alias'];
  if (typeof aliases === 'string') {
    return [aliases];
  }
  if (Array.isArray(aliases)) {
    return aliases.filter((a): a is string => typeof a === 'string');
  }
  return null;
}
