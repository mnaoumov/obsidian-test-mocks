import { iconRegistry } from '../internal/IconRegistry.ts';

export function addIcon(iconId: string, svgContent: string): void {
  iconRegistry.set(iconId, svgContent);
}
