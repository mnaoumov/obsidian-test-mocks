import { noopAsync } from '../../internal/noop.ts';

export async function loadMermaid(): Promise<unknown> {
  await noopAsync();
  return {};
}
