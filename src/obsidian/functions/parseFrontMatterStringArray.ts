import { parseFrontMatterEntry } from './parseFrontMatterEntry.ts';

export function parseFrontMatterStringArray(frontmatter: unknown, key: RegExp | string): null | string[] {
  const entry = parseFrontMatterEntry(frontmatter, key);
  if (typeof entry === 'string') {
    return [entry];
  }
  if (Array.isArray(entry)) {
    return entry.filter((item): item is string => typeof item === 'string');
  }
  return null;
}
