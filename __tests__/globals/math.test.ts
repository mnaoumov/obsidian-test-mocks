import {
  describe,
  expect,
  it
} from 'vitest';

import {
  clamp,
  square
} from '../../src/globals/Math.ts';

const MIN = 0;
const MAX = 10;
const BELOW = -5;
const ABOVE = 15;
const MID = 5;

describe('Math extensions', () => {
  describe('clamp', () => {
    it('should return the value when within range', () => {
      expect(clamp(MID, MIN, MAX)).toBe(MID);
    });

    it('should return min when value is below range', () => {
      expect(clamp(BELOW, MIN, MAX)).toBe(MIN);
    });

    it('should return max when value is above range', () => {
      expect(clamp(ABOVE, MIN, MAX)).toBe(MAX);
    });

    it('should return the boundary when min equals max', () => {
      const BOUNDARY = 3;
      expect(clamp(MID, BOUNDARY, BOUNDARY)).toBe(BOUNDARY);
    });
  });

  describe('square', () => {
    it('should return the square of a positive number', () => {
      const INPUT = 3;
      const EXPECTED = 9;
      expect(square(INPUT)).toBe(EXPECTED);
    });

    it('should return the square of a negative number', () => {
      const INPUT = -4;
      const EXPECTED = 16;
      expect(square(INPUT)).toBe(EXPECTED);
    });

    it('should return 0 for 0', () => {
      expect(square(0)).toBe(0);
    });
  });
});
