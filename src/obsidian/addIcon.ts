import { iconRegistry } from './iconRegistry.ts';

export function addIcon(iconId: string, svgContent: string): void {
  iconRegistry.set(iconId, svgContent);
}
