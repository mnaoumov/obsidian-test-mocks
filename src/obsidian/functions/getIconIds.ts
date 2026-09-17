/**
 * @file
 *
 * Mock of Obsidian's `getIconIds`.
 */

import type { IconName as IconNameOriginal } from 'obsidian';

import { iconRegistry } from '../../internal/icon-registry.ts';

/**
 * Lists the registered icons. The mock lists only icons added with `addIcon` and not since removed.
 *
 * @returns The registered icon ids.
 */
export function getIconIds(): IconNameOriginal[] {
  return [...iconRegistry.keys()];
}
