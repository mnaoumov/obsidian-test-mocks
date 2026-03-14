import {
  describe,
  expect,
  it
} from 'vitest';

import { loadPdfJs } from './loadPdfJs.ts';

describe('loadPdfJs', () => {
  it('should resolve with an object', async () => {
    const result = await loadPdfJs();
    expect(result).toEqual({});
  });
});
