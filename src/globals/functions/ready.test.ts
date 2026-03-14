import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { ready } from './ready.ts';

describe('ready', () => {
  it('should invoke the provided function immediately', () => {
    const fn = vi.fn();
    ready(fn);
    expect(fn).toHaveBeenCalledOnce();
  });
});
