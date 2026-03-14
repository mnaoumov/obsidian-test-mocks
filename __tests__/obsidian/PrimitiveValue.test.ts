import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { PrimitiveValue } from '../../src/obsidian/PrimitiveValue.ts';

// Minimal subclass that does NOT override asOriginalType__.
class MinimalPrimitiveValue extends PrimitiveValue<number> {
  public constructor(value: number) {
    super(value);
  }
}

describe('PrimitiveValue', () => {
  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = new MinimalPrimitiveValue(0);
      const original: PrimitiveValueOriginal<number> = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });

  describe('constructor3__', () => {
    it('should be callable without throwing', () => {
      const val = new MinimalPrimitiveValue(0);
      expect(() => {
        val.constructor3__(0);
      }).not.toThrow();
    });
  });
});
