import { iconRegistry } from '../internal/IconRegistry.ts';

export function getIconIds(): string[] {
  return Array.from(iconRegistry.keys());
}
