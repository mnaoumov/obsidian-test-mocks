import { iconRegistry } from '../internal/icon-registry.ts';

export function getIcon(iconId: string): null | SVGSVGElement {
  const svgContent = iconRegistry.get(iconId);
  if (!svgContent) {
    return null;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.innerHTML = svgContent;
  return svg;
}
