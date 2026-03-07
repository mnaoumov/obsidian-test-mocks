import { iterateRefs } from './iterateRefs.ts';

export function iterateCacheRefs(cache: { links?: unknown[]; embeds?: unknown[]; frontmatterLinks?: unknown[] }, cb: (ref: unknown) => boolean | void): boolean {
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
