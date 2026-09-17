/**
 * @file
 *
 * Mock of Obsidian's `setIcon`.
 */

import type { IconName as IconNameOriginal } from 'obsidian';

import { getIcon } from './getIcon.ts';

/**
 * Puts an icon at the start of an element, as Obsidian does. When the element's first child is already an `<svg>`
 * carrying the icon id as a class, nothing changes. Otherwise that first child, whatever it is, is removed and the
 * icon from `getIcon` is appended; when there is no such icon, the first child is still removed.
 *
 * The mock knows only icons added with `addIcon`; see `getIcon`.
 *
 * @param parent - The element to put the icon in.
 * @param iconId - The icon id.
 */
export function setIcon(parent: HTMLElement, iconId: IconNameOriginal): void {
  const firstChild = parent.firstChild;
  if (firstChild instanceof SVGSVGElement && firstChild.classList.contains(iconId)) {
    return;
  }
  firstChild?.remove();
  const icon = getIcon(iconId);
  if (icon) {
    parent.append(icon);
  }
}
