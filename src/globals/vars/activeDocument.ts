/**
 * @file
 *
 * Mock of Obsidian's global `activeDocument` variable.
 */

/**
 * The actively focused document, which Obsidian points at a pop-out window's document while that window has focus.
 * The mock has no pop-out windows, so it is always the global `document`.
 */
export const activeDocument = document;
