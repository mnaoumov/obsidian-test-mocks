/**
 * @file
 *
 * Mock of Obsidian's global `sleep` helper.
 */

/**
 * Waits for a number of milliseconds, using `setTimeout`, so fake timers control it.
 *
 * @param ms - The delay in milliseconds.
 * @returns A promise that resolves after the delay.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve): void => {
    setTimeout(resolve, ms);
  });
}
