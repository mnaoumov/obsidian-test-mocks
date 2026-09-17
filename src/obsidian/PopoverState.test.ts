import {
  describe,
  expect,
  it
} from 'vitest';

import { PopoverState } from './PopoverState.ts';

describe('PopoverState', () => {
  it('should carry the four states Obsidian defines, numbered from 0', () => {
    expect([PopoverState.Showing, PopoverState.Shown, PopoverState.Hiding, PopoverState.Hidden]).toEqual([0, 1, 2, 3]);
  });
});
