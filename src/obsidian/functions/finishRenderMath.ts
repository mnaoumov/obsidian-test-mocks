/**
 * @file
 *
 * Mock of Obsidian's `finishRenderMath`.
 */

import { noopAsync } from '../../internal/noop.ts';

/**
 * Flushes the MathJax stylesheet once `renderMath` calls are done. A no-op in the mock, which loads no MathJax.
 */
export async function finishRenderMath(): Promise<void> {
  await noopAsync();
}
