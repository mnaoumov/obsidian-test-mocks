import { iconRegistry } from './iconRegistry.ts';

export function removeIcon(iconId: string): void {
  iconRegistry.delete(iconId);
}
