import {
  describe,
  expect,
  it
} from 'vitest';

import { loadMermaid } from './loadMermaid.ts';

describe('loadMermaid', () => {
  it('should resolve with an object', async () => {
    const result = await loadMermaid();
    expect(result).toEqual({});
  });
});
