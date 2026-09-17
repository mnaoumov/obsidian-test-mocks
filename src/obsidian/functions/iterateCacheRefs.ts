import type {
  CachedMetadata as CachedMetadataOriginal,
  ReferenceCache as ReferenceCacheOriginal,
  Reference as ReferenceOriginal
} from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

import { assert } from '../../internal/type-guards.ts';
import { iterateRefs } from './iterateRefs.ts';

export function iterateCacheRefs(cache: CachedMetadataOriginal, callback: (ref: ReferenceCacheOriginal) => MaybeReturn<boolean>): boolean {
  return (cache.links !== undefined && iterateRefs(cache.links, referenceCallback))
    || (cache.embeds !== undefined && iterateRefs(cache.embeds, referenceCallback));

  function referenceCallback(ref: ReferenceOriginal): MaybeReturn<boolean> {
    const maybeReferenceCache = ref as Partial<ReferenceCacheOriginal>;
    assert(!!maybeReferenceCache.position, 'Should be ReferenceCache, but position property is missing');
    return callback(maybeReferenceCache as ReferenceCacheOriginal);
  }
}
