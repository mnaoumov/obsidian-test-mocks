import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { NumberValue } from '../../src/obsidian/NumberValue.ts';

describe('PrimitiveValue', () => {
  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      // NumberValue extends PrimitiveValue, so we test via NumberValue
      const val = NumberValue.create__();
      const original: PrimitiveValueOriginal<number> = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});
