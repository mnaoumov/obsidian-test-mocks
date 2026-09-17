/**
 * @file
 *
 * Mock of Obsidian's `getIcon`.
 */

import { iconRegistry } from '../../internal/icon-registry.ts';

/**
 * Creates an SVG element for an icon. As in Obsidian, an icon added with `addIcon` becomes an `<svg>` with a
 * `0 0 100 100` view box holding the icon's content, and the element carries the classes `svg-icon` and the icon id.
 *
 * The mock knows only icons added with `addIcon`. Obsidian also resolves its Lucide set (`lucide-*` names and the
 * legacy aliases mapped onto it) and its own glyphs; those are a few hundred kilobytes of SVG data and are
 * deliberately not bundled, so their ids return `null` here.
 *
 * @param iconId - The icon id.
 * @returns A new SVG element for the icon, or `null` when the mock has no icon with that id.
 */
export function getIcon(iconId: string): null | SVGSVGElement {
  const svgContent = iconRegistry.get(iconId);
  if (svgContent === undefined) {
    return null;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.innerHTML = svgContent;
  svg.classList.add('svg-icon', iconId);
  return svg;
}
