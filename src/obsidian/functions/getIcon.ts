/**
 * @file
 *
 * Mock of Obsidian's `getIcon`.
 */

import { iconRegistry } from '../../internal/icon-registry.ts';

/**
 * Creates an SVG element for an icon. The mock knows only icons registered with `addIcon`, not Obsidian's built-in
 * or Lucide icons.
 *
 * @param iconId - The icon id.
 * @returns A new SVG element holding the icon's content, or `null` when no icon has that id.
 */
export function getIcon(iconId: string): null | SVGSVGElement {
  const svgContent = iconRegistry.get(iconId);
  if (!svgContent) {
    return null;
  }
  const svg = createSvg('svg');
  svg.innerHTML = svgContent;
  return svg;
}
