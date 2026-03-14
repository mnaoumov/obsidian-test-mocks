import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ObjectValue } from '../../src/obsidian/ObjectValue.ts';

describe('NotNullValue', () => {
  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      // ObjectValue extends NotNullValue, so we test via ObjectValue
      const val = ObjectValue.create__({});
      const original: NotNullValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});
