import {
  describe,
  expect,
  it
} from 'vitest';

import { finishRenderMath } from './finishRenderMath.ts';

describe('finishRenderMath', () => {
  it('should resolve without error', async () => {
    await expect(finishRenderMath()).resolves.toBeUndefined();
  });
});
