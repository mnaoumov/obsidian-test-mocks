import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { ObjectValue } from './ObjectValue.ts';

describe('ObjectValue', () => {
  it('should create an instance via create__', () => {
    const value = ObjectValue.create__({});
    expect(value).toBeInstanceOf(ObjectValue);
  });

  it('should always be truthy', () => {
    const value = new ObjectValue({});
    expect(value.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const value = new ObjectValue({});
    expect(String(value)).toBe('');
  });

  describe('isEmpty', () => {
    it('should return true for an empty object', () => {
      expect(new ObjectValue({}).isEmpty()).toBe(true);
    });

    it('should return false for a non-empty object', () => {
      expect(new ObjectValue({ a: 'x' }).isEmpty()).toBe(false);
    });

    it('should return true for null', () => {
      expect(new ObjectValue(null).isEmpty()).toBe(true);
    });

    it('should return true for a non-object value', () => {
      const NON_OBJECT = 5;
      expect(new ObjectValue(NON_OBJECT).isEmpty()).toBe(true);
    });
  });

  describe('get', () => {
    it('should return null', () => {
      expect(new ObjectValue({ a: 'x' }).get('a')).toBeNull();
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const value = ObjectValue.create__({});
      const original: ObjectValueOriginal = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ObjectValue.create__({});
      const mock = ObjectValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });
});
