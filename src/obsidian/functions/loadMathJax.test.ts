import {
  describe,
  expect,
  it
} from 'vitest';

import { loadMathJax } from './loadMathJax.ts';

describe('loadMathJax', () => {
  it('should resolve without error', async () => {
    await expect(loadMathJax()).resolves.toBeUndefined();
  });
});
