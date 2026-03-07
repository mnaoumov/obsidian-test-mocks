export function parseFrontMatterTags(frontmatter: Record<string, unknown> | null): string[] | null {
  if (!frontmatter) {
    return null;
  }
  const raw = frontmatter['tags'] ?? frontmatter['tag'];
  if (typeof raw === 'string') {
    return [raw.startsWith('#') ? raw : '#' + raw];
  }
  if (Array.isArray(raw)) {
    return raw
      .filter((t): t is string => typeof t === 'string')
      .map((t) => (t.startsWith('#') ? t : '#' + t));
  }
  return null;
}
