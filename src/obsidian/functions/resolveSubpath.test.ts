import {
  describe,
  expect,
  it
} from 'vitest';

import { resolveSubpath } from './resolveSubpath.ts';

describe('resolveSubpath', () => {
  it('should return null', () => {
    expect(resolveSubpath({}, '#heading')).toBeNull();
  });
});
