import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { RegExpValue } from './RegExpValue.ts';

describe('RegExpValue', () => {
  it('should create an instance via create__', () => {
    const val = RegExpValue.create__(/test/);
    expect(val).toBeInstanceOf(RegExpValue);
  });

  it('should always be truthy', () => {
    const val = new RegExpValue(/test/);
    expect(val.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const val = new RegExpValue(/test/);
    expect(String(val)).toBe('');
  });

  describe('asOriginalType__', () => {
    it('should return the same instance typed as the original', () => {
      const val = RegExpValue.create__(/abc/);
      const original: RegExpValueOriginal = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = RegExpValue.create__(/abc/);
      const mock = RegExpValue.fromOriginalType__(val.asOriginalType__());
      expect(mock).toBe(val);
    });
  });
});
