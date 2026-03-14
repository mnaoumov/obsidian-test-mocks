import {
  describe,
  expect,
  it
} from 'vitest';

import { renderMatches } from './renderMatches.ts';

describe('renderMatches', () => {
  it('should not throw', () => {
    const el = createDiv();
    expect(() => {
      renderMatches(el, 'text', [[0, 1]]);
    }).not.toThrow();
  });
});
