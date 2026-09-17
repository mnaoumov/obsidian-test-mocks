import { ensureGenericObject } from '../../internal/type-guards.ts';

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
