import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { RelativeDateValue } from './RelativeDateValue.ts';

describe('RelativeDateValue', () => {
  it('should create an instance via create2__', () => {
    const val = RelativeDateValue.create2__(new Date());
    expect(val).toBeInstanceOf(RelativeDateValue);
  });

  it('should accept showTime parameter', () => {
    const val = RelativeDateValue.create2__(new Date(), true);
    expect(val).toBeInstanceOf(RelativeDateValue);
  });

  it('should be truthy', () => {
    const val = RelativeDateValue.create2__(new Date());
    expect(val.isTruthy()).toBe(true);
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = RelativeDateValue.create2__(new Date());
      const original: RelativeDateValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = RelativeDateValue.create2__(new Date());
      const mock = RelativeDateValue.fromOriginalType__(val.asOriginalType__());
      expect(mock).toBe(val);
    });
  });
});
