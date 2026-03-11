import { iterateRefs } from './iterateRefs.ts';

export function iterateCacheRefs(
  // eslint-disable-next-line no-restricted-syntax -- Matches obsidian.d.ts signature.
  cache: { embeds?: unknown[]; frontmatterLinks?: unknown[]; links?: unknown[] },
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- Matches obsidian.d.ts signature.
  cb: (ref: unknown) => boolean | void
): boolean {
  if (cache.links && iterateRefs(cache.links, cb)) {
    return true;
  }
  if (cache.embeds && iterateRefs(cache.embeds, cb)) {
    return true;
  }
  if (cache.frontmatterLinks && iterateRefs(cache.frontmatterLinks, cb)) {
    return true;
  }
  return false;
}
