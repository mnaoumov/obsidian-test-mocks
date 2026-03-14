import {
  describe,
  expect,
  it
} from 'vitest';

import {
  contains,
  findLastIndex,
  first,
  last,
  remove,
  shuffle,
  unique
} from '../../src/globals/Array.prototype.ts';

describe('Array.prototype extensions', () => {
  describe('contains', () => {
    it('should return true when array includes the target', () => {
      expect(contains.call(['a', 'b', 'c'], 'b')).toBe(true);
    });

    it('should return false when array does not include the target', () => {
      expect(contains.call(['a', 'b', 'c'], 'd')).toBe(false);
    });
  });

  describe('findLastIndex', () => {
    it('should return the last matching index', () => {
      const arr = ['a', 'b', 'a'];
      const result = findLastIndex.call(arr, (v: string) => v === 'a');
      expect(result).toBe(arr.length - 1);
    });

    it('should return -1 when no element matches', () => {
      const result = findLastIndex.call(['a', 'b'], (v: string) => v === 'z');
      expect(result).toBe(-1);
    });

    it('should return -1 for an empty array', () => {
      const result = findLastIndex.call([], () => true);
      expect(result).toBe(-1);
    });
  });

  describe('first', () => {
    it('should return the first element', () => {
      expect(first.call(['x', 'y'])).toBe('x');
    });

    it('should return undefined for empty array', () => {
      expect(first.call([])).toBeUndefined();
    });
  });

  describe('last', () => {
    it('should return the last element', () => {
      expect(last.call(['x', 'y', 'z'])).toBe('z');
    });

    it('should return undefined for empty array', () => {
      expect(last.call([])).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove the target from the array', () => {
      const arr = ['a', 'b', 'c'];
      remove.call(arr, 'b');
      expect(arr).toEqual(['a', 'c']);
    });

    it('should do nothing when the target is not found', () => {
      const arr = ['a', 'b', 'c'];
      remove.call(arr, 'z');
      expect(arr).toEqual(['a', 'b', 'c']);
    });
  });

  describe('shuffle', () => {
    it('should reverse the array in-place (deterministic for tests)', () => {
      const arr = ['a', 'b', 'c'];
      const result = shuffle.call(arr);
      expect(result).toEqual(['c', 'b', 'a']);
      expect(result).toBe(arr);
    });
  });

  describe('unique', () => {
    it('should return only unique elements', () => {
      const result = unique.call(['a', 'b', 'b', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should return empty array for empty input', () => {
      expect(unique.call([])).toEqual([]);
    });
  });
});
