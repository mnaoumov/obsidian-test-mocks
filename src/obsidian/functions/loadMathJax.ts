/**
 * @file
 *
 * Mock of Obsidian's `loadMathJax`.
 */

import { noopAsync } from '../../internal/noop.ts';

/**
 * Loads the MathJax library. A no-op in the mock, which resolves without loading anything.
 */
export async function loadMathJax(): Promise<void> {
  await noopAsync();
}
