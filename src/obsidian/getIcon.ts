import { iconRegistry } from '../internal/IconRegistry.ts';

export function getIcon(iconId: string): SVGSVGElement | null {
  const svgContent = iconRegistry.get(iconId);
  if (!svgContent) {
    return null;
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.innerHTML = svgContent;
  return svg;
}
