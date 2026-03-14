import {
  describe,
  expect,
  it
} from 'vitest';

import { nextFrame } from '../../../src/globals/functions/nextFrame.ts';

describe('nextFrame', () => {
  it('should resolve', async () => {
    await nextFrame();
    expect(true).toBe(true);
  });
});
