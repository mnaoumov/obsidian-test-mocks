import { iconRegistry } from '../internal/IconRegistry.ts';

export function removeIcon(iconId: string): void {
  iconRegistry.delete(iconId);
}
