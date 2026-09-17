/**
 * @file
 *
 * Mock of Obsidian's `removeIcon`.
 */

import { iconRegistry } from '../../internal/icon-registry.ts';

/**
 * Removes a custom icon from the icon library. The mock deletes it from the in-memory registry `addIcon` fills.
 *
 * @param iconId - The icon id.
 */
export function removeIcon(iconId: string): void {
  iconRegistry.delete(iconId);
}
