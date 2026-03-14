import {
  describe,
  expect,
  it
} from 'vitest';

import { setTooltip } from './setTooltip.ts';

describe('setTooltip', () => {
  it('should not throw', () => {
    const el = createDiv();
    expect(() => {
      setTooltip(el, 'tip');
    }).not.toThrow();
  });
});
