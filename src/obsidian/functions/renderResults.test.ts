import {
  describe,
  expect,
  it
} from 'vitest';

import { renderResults } from './renderResults.ts';

describe('renderResults', () => {
  it('should not throw', () => {
    const el = createDiv();
    expect(() => {
      renderResults(el, 'text', { matches: [], score: 0 });
    }).not.toThrow();
  });
});
