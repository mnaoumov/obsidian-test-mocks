import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { RegExpValue } from './RegExpValue.ts';

describe('RegExpValue', () => {
  it('should carry the regex icon', () => {
    expect(new RegExpValue(/test/).icon).toBe('lucide-regex');
  });

  it('should create an instance via create__', () => {
    const value = RegExpValue.create__(/test/);
    expect(value).toBeInstanceOf(RegExpValue);
  });

  it('should always be truthy', () => {
    const value = new RegExpValue(/test/);
    expect(value.isTruthy()).toBe(true);
  });

  describe('regexp', () => {
    it('should keep the very pattern it was handed', () => {
      const regexp = /abc/gi;
      expect(new RegExpValue(regexp).regexp).toBe(regexp);
    });
  });

  describe('toString', () => {
    it('should print the wrapped pattern, flags included', () => {
      expect(String(new RegExpValue(/abc/gi))).toBe('/abc/gi');
    });

    it('should tell two patterns apart', () => {
      expect(String(new RegExpValue(/abc/))).not.toBe(String(new RegExpValue(/def/)));
    });
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
