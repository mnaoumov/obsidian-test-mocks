import { iconRegistry } from '../internal/icon-registry.ts';

export function setIcon(parent: HTMLElement, iconId: string): void {
  const svgContent = iconRegistry.get(iconId);
  if (svgContent) {
    parent.innerHTML = svgContent;
  }
}
