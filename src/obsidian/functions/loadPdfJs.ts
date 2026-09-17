/**
 * @file
 *
 * Mock of Obsidian's `loadPdfJs`.
 */

import { noopAsync } from '../../internal/noop.ts';

/**
 * Loads the PDF.js library and resolves to the global `pdfjsLib` object. The mock loads nothing.
 *
 * @returns A promise resolving to an empty object standing in for `pdfjsLib`.
 */
export async function loadPdfJs(): Promise<unknown> {
  await noopAsync();
  return {};
}
