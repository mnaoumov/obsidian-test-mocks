import type { CachedMetadata as CachedMetadataOriginal } from 'obsidian';

import { parseFrontMatterTags } from './parseFrontMatterTags.ts';

export function getAllTags(cache: CachedMetadataOriginal): null | string[] {
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
