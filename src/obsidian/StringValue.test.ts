import type { StringValue as StringValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { StringValue } from './StringValue.ts';

describe('StringValue', () => {
  it('should create an instance via create__', () => {
    const val = StringValue.create__();
    expect(val).toBeInstanceOf(StringValue);
  });

  it('should default to empty string', () => {
    const val = new StringValue();
    expect(val.value__).toBe('');
  });

  it('should accept a value', () => {
    const val = new StringValue('hello');
    expect(val.value__).toBe('hello');
  });

  it('should return false for isTruthy when empty', () => {
    const val = new StringValue('');
    expect(val.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when non-empty', () => {
    const val = new StringValue('hello');
    expect(val.isTruthy()).toBe(true);
  });

  it('should return the string for toString', () => {
    const val = new StringValue('hello');
    expect(String(val)).toBe('hello');
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', () => {
      const val = StringValue.create__('test');
      const original: StringValueOriginal = val.asOriginalType4__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = StringValue.create__('test');
      const mock = StringValue.fromOriginalType4__(val.asOriginalType4__());
      expect(mock).toBe(val);
    });
  });
});
