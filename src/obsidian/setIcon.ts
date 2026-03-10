import type { IconName as IconNameOriginal } from 'obsidian';

import { iconRegistry } from '../internal/icon-registry.ts';

export function setIcon(parent: HTMLElement, iconId: IconNameOriginal): void {
  const svgContent = iconRegistry.get(iconId);
  if (svgContent) {
    parent.innerHTML = svgContent;
  }
}
