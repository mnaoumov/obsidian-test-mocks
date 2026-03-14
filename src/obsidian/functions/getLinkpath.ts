import { ensureNonNullable } from '../../internal/type-guards.ts';

export function getLinkpath(linktext: string): string {
  return ensureNonNullable(linktext.split('#')[0]);
}
