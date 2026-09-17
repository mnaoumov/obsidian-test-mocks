/**
 * @file
 *
 * Mock of Obsidian's `iterateRefs`.
 */

import type { Reference as ReferenceOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

/**
 * Iterates references in order, stopping as soon as the callback returns `true`.
 *
 * @param refs - The references to iterate.
 * @param callback - Called for each reference; returning `true` stops the iteration.
 * @returns `true` when the callback returned `true`, `false` otherwise.
 */
export function iterateRefs(refs: ReferenceOriginal[], callback: (ref: ReferenceOriginal) => MaybeReturn<boolean>): boolean {
  for (const ref of refs) {
    if (callback(ref) === true) {
      return true;
    }
  }
  return false;
}
