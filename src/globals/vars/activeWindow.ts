/**
 * @file
 *
 * Mock of Obsidian's global `activeWindow` variable.
 */

/**
 * The actively focused window, which Obsidian points at a pop-out window while it has focus. The mock has no pop-out
 * windows, so it is always the global `window`.
 */
export const activeWindow = window;
