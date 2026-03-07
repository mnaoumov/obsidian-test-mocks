import { parseFrontMatterEntry } from './parseFrontMatterEntry.ts';

export function parseFrontMatterStringArray(frontmatter: Record<string, unknown> | null, key: string | RegExp): string[] | null {
  const entry = parseFrontMatterEntry(frontmatter, key);
  if (typeof entry === 'string') {
    return [entry];
  }
  if (Array.isArray(entry)) {
    return entry.filter((e): e is string => typeof e === 'string');
  }
  return null;
}
