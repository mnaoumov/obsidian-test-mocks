/**
 * @file
 *
 * Mock of Obsidian's `loadPrism`.
 */

import { noopAsync } from '../../internal/noop.ts';

/**
 * Loads the Prism syntax highlighter and resolves to the global `Prism` object. The mock loads nothing.
 *
 * @returns A promise resolving to an empty object standing in for `Prism`.
 */
export async function loadPrism(): Promise<unknown> {
  await noopAsync();
  return {};
}
