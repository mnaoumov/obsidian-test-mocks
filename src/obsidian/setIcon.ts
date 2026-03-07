import { iconRegistry } from '../internal/IconRegistry.ts';

export function setIcon(parent: HTMLElement, iconId: string): void {
  const svgContent = iconRegistry.get(iconId);
  if (svgContent) {
    parent.innerHTML = svgContent;
  }
}
