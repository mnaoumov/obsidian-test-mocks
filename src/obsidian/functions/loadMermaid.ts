/**
 * @file
 *
 * Mock of Obsidian's `loadMermaid`.
 */

import { noopAsync } from '../../internal/noop.ts';

/**
 * Loads the Mermaid library and resolves to the global `mermaid` object. The mock loads nothing.
 *
 * @returns A promise resolving to an empty object standing in for `mermaid`.
 */
export async function loadMermaid(): Promise<unknown> {
  await noopAsync();
  return {};
}
