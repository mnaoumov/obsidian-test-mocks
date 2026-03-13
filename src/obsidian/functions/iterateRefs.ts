import type { Reference as ReferenceOriginal } from 'obsidian';

import type { MaybeReturn } from '../../internal/types.ts';

export function iterateRefs(refs: ReferenceOriginal[], cb: (ref: ReferenceOriginal) => MaybeReturn<boolean>): boolean {
  for (const ref of refs) {
    if (cb(ref) === true) {
      return true;
    }
  }
  return false;
}
