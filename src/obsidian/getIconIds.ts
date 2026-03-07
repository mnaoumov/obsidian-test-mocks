import { iconRegistry } from './iconRegistry.ts';

export function getIconIds(): string[] {
  return Array.from(iconRegistry.keys());
}
