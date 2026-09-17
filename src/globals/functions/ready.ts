/**
 * @file
 *
 * Mock of Obsidian's global `ready` helper.
 */

/**
 * Runs a function once the DOM is ready. The mock treats the DOM as always ready and calls it immediately.
 *
 * @param $function - The function to run.
 */
export function ready($function: () => unknown): void {
  $function();
}
