import { noopAsync } from '../../internal/noop.ts';

export async function loadPdfJs(): Promise<unknown> {
  await noopAsync();
  return {};
}
