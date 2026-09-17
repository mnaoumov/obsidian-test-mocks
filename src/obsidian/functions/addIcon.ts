/**
 * @file
 *
 * Mock of Obsidian's `addIcon`, which registers a custom icon.
 */

import { iconRegistry } from '../../internal/icon-registry.ts';

/**
 * Adds an icon to the icon library. The mock stores the SVG content in an in-memory registry shared with `getIcon`,
 * `getIconIds`, `removeIcon` and `setIcon`.
 *
 * @param iconId - The icon id.
 * @param svgContent - The inner content of the SVG.
 */
export function addIcon(iconId: string, svgContent: string): void {
  iconRegistry.set(iconId, svgContent);
}
