import { parseFrontMatterTags } from './parseFrontMatterTags.ts';

export function getAllTags(cache: { frontmatter?: Record<string, unknown>; tags?: { tag: string }[] }): null | string[] {
  const tags: string[] = [];
  if (cache.tags) {
    for (const t of cache.tags) {
      tags.push(t.tag);
    }
  }
  const fmTags = parseFrontMatterTags(cache.frontmatter ?? null);
  if (fmTags) {
    tags.push(...fmTags);
  }
  return tags.length > 0 ? tags : null;
}
