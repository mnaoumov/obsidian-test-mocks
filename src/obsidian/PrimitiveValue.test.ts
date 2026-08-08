import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { PrimitiveValue } from './PrimitiveValue.ts';

// Minimal subclass that does NOT override asOriginalType3__.
class MinimalPrimitiveValue extends PrimitiveValue<number> {
  public constructor(value: number) {
    super(value);
  }
}

describe('PrimitiveValue', () => {
  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const value = new MinimalPrimitiveValue(0);
      const original: PrimitiveValueOriginal<number> = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = new MinimalPrimitiveValue(0);
      const mock = PrimitiveValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });

  describe('constructor3__', () => {
    it('should be callable without throwing', () => {
      const value = new MinimalPrimitiveValue(0);
      expect(() => {
        value.constructor3__(0);
      }).not.toThrow();
    });
  });
});
