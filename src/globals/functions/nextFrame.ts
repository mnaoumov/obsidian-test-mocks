import { noopAsync } from '../../internal/noop.ts';

export function nextFrame(): Promise<void> {
  return noopAsync();
}
