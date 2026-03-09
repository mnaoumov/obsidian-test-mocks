import { noopAsync } from '../internal/Noop.ts';

export async function loadMathJax(): Promise<void> {
  await noopAsync();
}
