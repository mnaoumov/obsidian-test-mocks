import { iconRegistry } from '../../internal/icon-registry.ts';

export function removeIcon(iconId: string): void {
  iconRegistry.delete(iconId);
}
