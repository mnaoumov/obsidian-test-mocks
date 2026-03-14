import {
  describe,
  expect,
  it
} from 'vitest';

import { loadPrism } from './loadPrism.ts';

describe('loadPrism', () => {
  it('should resolve with an object', async () => {
    const result = await loadPrism();
    expect(result).toEqual({});
  });
});
