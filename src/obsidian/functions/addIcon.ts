import { iconRegistry } from '../../internal/icon-registry.ts';

export function addIcon(iconId: string, svgContent: string): void {
  iconRegistry.set(iconId, svgContent);
}
