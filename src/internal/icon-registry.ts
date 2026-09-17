/**
 * @file
 *
 * The icon library shared by the mocked `addIcon`, `getIcon`, `getIconIds`, `removeIcon` and `setIcon` functions.
 */

/**
 * The registered icons: SVG content keyed by icon id.
 */
const iconRegistry = new Map<string, string>();
export { iconRegistry };
