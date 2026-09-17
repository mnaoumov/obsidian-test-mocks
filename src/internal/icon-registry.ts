/**
 * @file
 *
 * The icon library shared by the mocked `addIcon`, `getIcon`, `getIconIds`, `removeIcon` and `setIcon` functions.
 */

/**
 * The icons added with `addIcon`: SVG content keyed by icon id. It starts empty, because the mock deliberately does not
 * bundle Obsidian's Lucide set or its own glyphs.
 */
const iconRegistry = new Map<string, string>();
export { iconRegistry };
