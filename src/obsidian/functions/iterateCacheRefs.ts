import type {
  CachedMetadata as CachedMetadataOriginal,
  ReferenceCache as ReferenceCacheOriginal,
  Reference as ReferenceOriginal
} from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

import { assert } from '../../internal/type-guards.ts';
import { iterateRefs } from './iterateRefs.ts';

export function iterateCacheRefs(cache: CachedMetadataOriginal, cb: (ref: ReferenceCacheOriginal) => MaybeReturn<boolean>): boolean {
  if (cache.links && iterateRefs(cache.links, referenceCallback)) {
    return true;
  }
  if (cache.embeds && iterateRefs(cache.embeds, referenceCallback)) {
    return true;
  }
  return false;

  function referenceCallback(ref: ReferenceOriginal): MaybeReturn<boolean> {
    const maybeReferenceCache = ref as Partial<ReferenceCacheOriginal>;
    assert(!!maybeReferenceCache.position, 'Should be ReferenceCache, but position property is missing');
    return cb(maybeReferenceCache as ReferenceCacheOriginal);
  }
}
