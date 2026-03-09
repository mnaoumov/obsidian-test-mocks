import { noop } from '../internal/Noop.ts';

// eslint-disable-next-line @typescript-eslint/require-await -- Implements async obsidian.d.ts interface.
export async function loadMathJax(): Promise<void> {
  noop();
}
