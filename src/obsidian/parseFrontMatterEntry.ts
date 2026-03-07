export function parseFrontMatterEntry(frontmatter: Record<string, unknown> | null, key: string | RegExp): unknown {
  if (!frontmatter) {
    return null;
  }
  if (typeof key === 'string') {
    return frontmatter[key] ?? null;
  }
  for (const [k, v] of Object.entries(frontmatter)) {
    if (key.test(k)) {
      return v;
    }
  }
  return null;
}
