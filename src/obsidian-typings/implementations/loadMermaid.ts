import type { Mermaid } from 'mermaid';

export async function loadMermaid(): Promise<Mermaid> {
  throw new Error('loadMermaid is not supported in test mocks');
}
