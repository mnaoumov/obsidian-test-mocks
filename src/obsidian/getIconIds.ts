import { iconRegistry } from '../internal/icon-registry.ts';

export function getIconIds(): string[] {
  return Array.from(iconRegistry.keys());
}
