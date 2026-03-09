import { noopAsync } from '../internal/Noop.ts';

export async function finishRenderMath(): Promise<void> {
  await noopAsync();
}
