/**
 * @file
 *
 * Mock of Obsidian's `setIcon`.
 */

import type { IconName as IconNameOriginal } from 'obsidian';

import { iconRegistry } from '../../internal/icon-registry.ts';
import { sanitizeHTMLToDom } from './sanitizeHTMLToDom.ts';

/**
 * Replaces an element's content with an icon; does nothing when no icon has the id. The mock knows only icons
 * registered with `addIcon`, and inserts the registered SVG content itself.
 *
 * @param parent - The element to put the icon in.
 * @param iconId - The icon id.
 */
export function setIcon(parent: HTMLElement, iconId: IconNameOriginal): void {
  const svgContent = iconRegistry.get(iconId);
  if (!svgContent) {
    return;
  }

  parent.empty();
  parent.append(sanitizeHTMLToDom(svgContent));
}
