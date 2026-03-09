// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- Matches obsidian.d.ts signature.
export function iterateRefs(refs: unknown[], cb: (ref: unknown) => boolean | void): boolean {
  for (const ref of refs) {
    if (cb(ref) === true) {
      return true;
    }
  }
  return false;
}
