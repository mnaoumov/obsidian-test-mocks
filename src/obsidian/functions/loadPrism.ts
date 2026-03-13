import { noopAsync } from '../../internal/noop.ts';

export async function loadPrism(): Promise<unknown> {
  await noopAsync();
  return {};
}
