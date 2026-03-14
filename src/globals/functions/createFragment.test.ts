import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { createFragment } from './createFragment.ts';

describe('createFragment', () => {
  it('should return a DocumentFragment', () => {
    const frag = createFragment();
    expect(frag).toBeInstanceOf(DocumentFragment);
  });

  it('should invoke the callback with the fragment', () => {
    const callback = vi.fn();
    const frag = createFragment(callback);
    expect(callback).toHaveBeenCalledWith(frag);
  });

  it('should not throw when callback is not provided', () => {
    expect(() => createFragment()).not.toThrow();
  });
});
