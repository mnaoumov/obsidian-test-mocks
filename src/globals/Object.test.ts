import {
  describe,
  expect,
  it
} from 'vitest';

import {
  each,
  isEmpty
} from './Object.ts';

const MULTIPLIER = 10;

describe('Object extensions', () => {
  describe('each', () => {
    it('should iterate over all entries', () => {
      const keys: string[] = [];
      const values: unknown[] = [];
      each({ a: 'x', b: 'y' }, (value, key) => {
        keys.push(key ?? '');
        values.push(value);
      });
      expect(keys).toEqual(['a', 'b']);
      expect(values).toEqual(['x', 'y']);
    });

    it('should return true when callback never returns false', () => {
      const isResult = each({ x: 'val' }, () => true);
      expect(isResult).toBe(true);
    });

    it('should stop early and return false when callback returns false', () => {
      const visited: string[] = [];
      const isResult = each({ a: 'x', b: 'y', c: 'z' }, (_value, key) => {
        visited.push(key ?? '');
        return key !== 'b';
      });
      expect(isResult).toBe(false);
      expect(visited).toEqual(['a', 'b']);
    });

    it('should bind the context', () => {
      const context = { multiplier: MULTIPLIER };
      let received = '';
      each({ a: 'val' }, function eachCallback(this: Record<string, unknown>, value) {
        received = `${String(this['multiplier'])}-${String(value)}`;
      }, context);
      expect(received).toBe(`${String(MULTIPLIER)}-val`);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty objects', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('should return false for non-empty objects', () => {
      expect(isEmpty({ key: 'value' })).toBe(false);
    });
  });
});
