import type { NumberValue as NumberValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { NumberValue } from './NumberValue.ts';

const TEST_NUMBER = 7;

describe('NumberValue', () => {
  it('should create an instance via create__', () => {
    const value = NumberValue.create__();
    expect(value).toBeInstanceOf(NumberValue);
  });

  it('should default to 0', () => {
    const value = new NumberValue();
    expect(value.value__).toBe(0);
  });

  it('should accept a value', () => {
    const value = new NumberValue(TEST_NUMBER);
    expect(value.value__).toBe(TEST_NUMBER);
  });

  it('should return false for isTruthy when 0', () => {
    const value = new NumberValue(0);
    expect(value.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when non-zero', () => {
    const value = new NumberValue(1);
    expect(value.isTruthy()).toBe(true);
  });

  it('should convert to string', () => {
    const value = new NumberValue(TEST_NUMBER);
    expect(String(value)).toBe(String(TEST_NUMBER));
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance typed as the original', () => {
      const value = NumberValue.create__();
      const original: NumberValueOriginal = value.asOriginalType4__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = NumberValue.create__();
      const mock = NumberValue.fromOriginalType4__(value.asOriginalType4__());
      expect(mock).toBe(value);
    });
  });
});
