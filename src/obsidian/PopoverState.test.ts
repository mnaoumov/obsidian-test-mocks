import {
  describe,
  expect,
  it
} from 'vitest';

import { PopoverState } from './PopoverState.ts';

describe('PopoverState', () => {
  it('should be defined with no members', () => {
    expect(Object.keys(PopoverState)).toHaveLength(0);
  });
});
