/**
 * @file
 *
 * Mock of Obsidian's `getAllTags`.
 */

import type { CachedMetadata as CachedMetadataOriginal } from 'obsidian';

import { parseFrontMatterTags } from './parseFrontMatterTags.ts';

/**
 * Combines the tags found in a note's frontmatter and in its content into a single array.
 *
 * @param cache - The note's cached metadata, or a falsy value when the note has none. `obsidian.d.ts`
 * declares the parameter non-nullable, but Obsidian itself guards it and `MetadataCache.getFileCache`
 * really does answer `null`, so the mock accepts that too.
 * @returns The frontmatter tags followed by the content tags (each `#`-prefixed, and never deduplicated),
 * or `null` when there is no cache. A cache holding no tags at all yields an empty array, which is how a
 * caller tells "no cache" from "no tags".
 */
export function getAllTags(cache: CachedMetadataOriginal | null): null | string[] {
  if (!cache) {
    return null;
  }
  const tags: string[] = [];
  const frontMatterTags = parseFrontMatterTags(cache.frontmatter ?? null);
  if (frontMatterTags) {
    tags.push(...frontMatterTags);
  }
  if (cache.tags) {
    for (const tag of cache.tags) {
      tags.push(tag.tag);
    }
  }
  return tags;
}
