import {
  describe,
  expect,
  it
} from 'vitest';

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

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const original = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = DurationValue.create__(0, 0, 0, 0, 0, 0, 0);
      const mock = DurationValue.fromOriginalType__(val.asOriginalType__());
      expect(mock).toBe(val);
    });
  });
});
