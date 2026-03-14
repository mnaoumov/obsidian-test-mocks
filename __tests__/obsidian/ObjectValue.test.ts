import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ObjectValue } from '../../src/obsidian/ObjectValue.ts';

describe('ObjectValue', () => {
  it('should create an instance via create__', () => {
    const val = ObjectValue.create__({});
    expect(val).toBeInstanceOf(ObjectValue);
  });

  it('should always be truthy', () => {
    const val = new ObjectValue({});
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new ObjectValue({});
    expect(String(val)).toBe('');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = ObjectValue.create__({});
      const original: ObjectValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });
});
