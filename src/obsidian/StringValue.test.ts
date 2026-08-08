import type { StringValue as StringValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { StringValue } from './StringValue.ts';

describe('StringValue', () => {
  it('should create an instance via create__', () => {
    const value = StringValue.create__();
    expect(value).toBeInstanceOf(StringValue);
  });

  it('should default to empty string', () => {
    const value = new StringValue();
    expect(value.value__).toBe('');
  });

  it('should accept a value', () => {
    const value = new StringValue('hello');
    expect(value.value__).toBe('hello');
  });

  it('should return false for isTruthy when empty', () => {
    const value = new StringValue('');
    expect(value.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when non-empty', () => {
    const value = new StringValue('hello');
    expect(value.isTruthy()).toBe(true);
  });

  it('should return the string for toString', () => {
    const value = new StringValue('hello');
    expect(String(value)).toBe('hello');
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', () => {
      const value = StringValue.create__('test');
      const original: StringValueOriginal = value.asOriginalType4__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = StringValue.create__('test');
      const mock = StringValue.fromOriginalType4__(value.asOriginalType4__());
      expect(mock).toBe(value);
    });
  });
});
