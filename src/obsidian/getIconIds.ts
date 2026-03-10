import type { IconName as IconNameOriginal } from 'obsidian';

import { iconRegistry } from '../internal/icon-registry.ts';

export function getIconIds(): IconNameOriginal[] {
  return Array.from(iconRegistry.keys());
}
