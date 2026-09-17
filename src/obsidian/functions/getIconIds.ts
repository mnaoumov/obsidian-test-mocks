/**
 * @file
 *
 * Mock of Obsidian's `getIconIds`.
 */

import type { IconName as IconNameOriginal } from 'obsidian';

import { iconRegistry } from '../../internal/icon-registry.ts';

/**
 * Lists the available icon ids. Obsidian lists its Lucide set, then the icons added with `addIcon`, then its own
 * glyphs; the mock does not bundle the built-in icons (see `getIcon`), so it lists only the icons added with
 * `addIcon` and not since removed, in the order they were added.
 *
 * @returns The registered icon ids.
 */
export function getIconIds(): IconNameOriginal[] {
  return [...iconRegistry.keys()];
}
