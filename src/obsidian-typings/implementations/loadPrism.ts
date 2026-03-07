import type { default as Prism } from 'prismjs';

export async function loadPrism(): Promise<typeof Prism> {
  throw new Error('loadPrism is not supported in test mocks');
}
