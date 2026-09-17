/**
 * @file
 *
 * Mock of Obsidian's global `nextFrame` helper.
 */

import { noopAsync } from '../../internal/noop.ts';

/**
 * Waits for the next animation frame. The mock does not wait for a frame; it resolves on the next microtask.
 *
 * @returns A promise that resolves once the wait is over.
 */
export function nextFrame(): Promise<void> {
  return noopAsync();
}
