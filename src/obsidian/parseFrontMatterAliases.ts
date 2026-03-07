export function parseFrontMatterAliases(frontmatter: Record<string, unknown> | null): string[] | null {
  if (!frontmatter) {
    return null;
  }
  const aliases = frontmatter['aliases'] ?? frontmatter['alias'];
  if (typeof aliases === 'string') {
    return [aliases];
  }
  if (Array.isArray(aliases)) {
    return aliases.filter((a): a is string => typeof a === 'string');
  }
  return null;
}
