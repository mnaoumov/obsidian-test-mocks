import type { IconName as IconNameOriginal } from 'obsidian';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { sanitizeHTMLToDom } from './sanitizeHTMLToDom.ts';

export function setIcon(parent: HTMLElement, iconId: IconNameOriginal): void {
  const svgContent = iconRegistry.get(iconId);
  if (svgContent) {
    parent.empty();
    parent.appendChild(sanitizeHTMLToDom(svgContent));
  }
}
