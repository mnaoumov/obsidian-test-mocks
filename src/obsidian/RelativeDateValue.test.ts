import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { RelativeDateValue } from './RelativeDateValue.ts';

describe('RelativeDateValue', () => {
  it('should create an instance via create2__', () => {
    const value = RelativeDateValue.create2__(new Date());
    expect(value).toBeInstanceOf(RelativeDateValue);
  });

  it('should accept showTime parameter', () => {
    const value = RelativeDateValue.create2__(new Date(), true);
    expect(value).toBeInstanceOf(RelativeDateValue);
  });

  it('should be truthy', () => {
    const value = RelativeDateValue.create2__(new Date());
    expect(value.isTruthy()).toBe(true);
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', () => {
      const value = RelativeDateValue.create2__(new Date());
      const original: RelativeDateValueOriginal = value.asOriginalType4__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = RelativeDateValue.create2__(new Date());
      const mock = RelativeDateValue.fromOriginalType4__(value.asOriginalType4__());
      expect(mock).toBe(value);
    });
  });
});
