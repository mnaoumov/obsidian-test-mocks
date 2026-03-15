import type { NullValue as NullValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { NullValue } from './NullValue.ts';

describe('NullValue', () => {
  it('should create an instance via create__', () => {
    const val = NullValue.create__();
    expect(val).toBeInstanceOf(NullValue);
  });

  it('should return false for isTruthy', () => {
    const val = new NullValue();
    expect(val.isTruthy()).toBe(false);
  });

  it('should return empty string for toString', () => {
    const val = new NullValue();
    expect(String(val)).toBe('');
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const val = NullValue.create__();
      const original: NullValueOriginal = val.asOriginalType2__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = NullValue.create__();
      const mock = NullValue.fromOriginalType2__(val.asOriginalType2__());
      expect(mock).toBe(val);
    });
  });
});
