import {
  describe,
  expect,
  it
} from 'vitest';

import { PopoverState } from './PopoverState.ts';

describe('PopoverState', () => {
  it('should be a valid enum object', () => {
    expect(PopoverState).toBeDefined();
  });
});
