import {
  describe,
  expect,
  it
} from 'vitest';

import { renderMath } from './renderMath.ts';

describe('renderMath', () => {
  it('should return an HTMLElement', () => {
    const el = renderMath('x^2', true);
    expect(el).toBeInstanceOf(HTMLElement);
  });
});
