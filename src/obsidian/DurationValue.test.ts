import {
  describe,
  expect,
  it
} from 'vitest';

import { DateValue } from './DateValue.ts';
import { DurationValue } from './DurationValue.ts';

describe('DurationValue', () => {
  it('should always be truthy', () => {
    const val = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new DurationValue(0, 0, 0, 0, 0, 0, 0);
    expect(String(val)).toBe('');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const val = DurationValue.create__(1, 0, 0, 0, 0, 0, 0);
      expect(val).toBeInstanceOf(DurationValue);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const original = val.asOriginalType3__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const mock = DurationValue.fromOriginalType3__(val.asOriginalType3__());
      expect(mock).toBe(val);
    });
  });

  describe('getMilliseconds', () => {
    it('should sum all the duration components', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 1, 500);
      expect(val.getMilliseconds()).toBe(1500);
    });
  });

  describe('fromMilliseconds', () => {
    it('should build a duration carrying the given milliseconds', () => {
      expect(DurationValue.fromMilliseconds(2000).getMilliseconds()).toBe(2000);
    });
  });

  describe('parseFromString', () => {
    it('should return null', () => {
      expect(DurationValue.parseFromString('1d')).toBeNull();
    });
  });

  describe('addToDate', () => {
    it('should return the provided date value', () => {
      const original = DateValue.create__(new Date()).asOriginalType3__();
      const dur = DurationValue.create__(0, 0, 1, 0, 0, 0, 0);
      expect(dur.addToDate(original)).toBe(original);
    });
  });
});
