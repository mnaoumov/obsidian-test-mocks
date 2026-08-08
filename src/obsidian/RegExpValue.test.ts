import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { RegExpValue } from './RegExpValue.ts';

describe('RegExpValue', () => {
  it('should create an instance via create__', () => {
    const value = RegExpValue.create__(/test/);
    expect(value).toBeInstanceOf(RegExpValue);
  });

  it('should always be truthy', () => {
    const value = new RegExpValue(/test/);
    expect(value.isTruthy()).toBe(true);
  });

  it('should return empty string for toString', () => {
    const value = new RegExpValue(/test/);
    expect(String(value)).toBe('');
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const value = RegExpValue.create__(/abc/);
      const original: RegExpValueOriginal = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = RegExpValue.create__(/abc/);
      const mock = RegExpValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });
});
