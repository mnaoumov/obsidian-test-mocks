import type { Reference as ReferenceOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

export function iterateRefs(refs: ReferenceOriginal[], callback: (ref: ReferenceOriginal) => MaybeReturn<boolean>): boolean {
  for (const ref of refs) {
    if (callback(ref) === true) {
      return true;
    }
  }
  return false;
}
