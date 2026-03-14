import {
  describe,
  expect,
  it
} from 'vitest';

import { combine } from './Array.ts';

describe('Array.combine', () => {
  it('should flatten nested arrays into one', () => {
    const input = [[1], [1], [1]];
    const result = combine(input);
    expect(result).toHaveLength(input.length);
  });

  it('should return empty array for empty input', () => {
    const result = combine([]);
    expect(result).toEqual([]);
  });

  it('should preserve elements from all sub-arrays', () => {
    const a = [1];
    const b = [1];
    const result = combine([a, b]);
    expect(result).toHaveLength(a.length + b.length);
  });
});
