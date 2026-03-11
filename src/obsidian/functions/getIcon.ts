import { iconRegistry } from '../../internal/icon-registry.ts';

export function getIcon(iconId: string): null | SVGSVGElement {
  const svgContent = iconRegistry.get(iconId);
  if (!svgContent) {
    return null;
  }
  const svg = createSvg('svg');
  svg.innerHTML = svgContent;
  return svg;
}
