import { noopAsync } from '../../internal/noop.ts';

export async function loadMathJax(): Promise<void> {
  await noopAsync();
}
