/**
 * @file
 *
 * Mock of Obsidian's `iterateCacheRefs`.
 */

import type {
  CachedMetadata as CachedMetadataOriginal,
  ReferenceCache as ReferenceCacheOriginal,
  Reference as ReferenceOriginal
} from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

import { assert } from '../../internal/type-guards.ts';
import { iterateRefs } from './iterateRefs.ts';

/**
 * Iterates the links and then the embeds of a note's cached metadata, stopping as soon as the callback returns
 * `true`. Obsidian deprecates it.
 *
 * @param cache - The note's cached metadata.
 * @param callback - Called for each reference; returning `true` stops the iteration.
 * @returns `true` when the callback returned `true`, `false` otherwise.
 * @throws If a reference has no `position`, so is not a `ReferenceCache`.
 */
export function iterateCacheRefs(cache: CachedMetadataOriginal, callback: (ref: ReferenceCacheOriginal) => MaybeReturn<boolean>): boolean {
  return (cache.links !== undefined && iterateRefs(cache.links, referenceCallback))
    || (cache.embeds !== undefined && iterateRefs(cache.embeds, referenceCallback));

  function referenceCallback(ref: ReferenceOriginal): MaybeReturn<boolean> {
    const maybeReferenceCache = ref as Partial<ReferenceCacheOriginal>;
    assert(!!maybeReferenceCache.position, 'Should be ReferenceCache, but position property is missing');
    return callback(maybeReferenceCache as ReferenceCacheOriginal);
  }
}
