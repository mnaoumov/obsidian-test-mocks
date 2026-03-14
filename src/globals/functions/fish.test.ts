import {
  afterEach,
  describe,
  expect,
  it
} from 'vitest';

import { fish } from './fish.ts';

describe('fish', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return matching element', () => {
    const div = document.createElement('div');
    div.id = 'target';
    document.body.appendChild(div);
    const result = fish('#target');
    expect(result).toBe(div);
  });

  it('should return null when no element matches', () => {
    const result = fish('#nonexistent');
    expect(result).toBeNull();
  });
});
