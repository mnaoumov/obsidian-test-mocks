import {
  describe,
  expect,
  it
} from 'vitest';

import { BooleanValue } from './BooleanValue.ts';

describe('BooleanValue', () => {
  it('should default to false', () => {
    const val = new BooleanValue();
    expect(val.value__).toBe(false);
  });

  it('should accept a value', () => {
    const val = new BooleanValue(true);
    expect(val.value__).toBe(true);
  });

  it('should return false for isTruthy when false', () => {
    const val = new BooleanValue(false);
    expect(val.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when true', () => {
    const val = new BooleanValue(true);
    expect(val.isTruthy()).toBe(true);
  });

  it('should return "false" for toString when false', () => {
    const val = new BooleanValue(false);
    expect(String(val)).toBe('false');
  });

  it('should return "true" for toString when true', () => {
    const val = new BooleanValue(true);
    expect(String(val)).toBe('true');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const val = BooleanValue.create__();
      expect(val).toBeInstanceOf(BooleanValue);
      expect(val.value__).toBe(false);
    });

    it('should create an instance with value via factory method', () => {
      const val = BooleanValue.create__(true);
      expect(val.value__).toBe(true);
    });
  });

  describe('asOriginalType__', () => {
    it('should return the same instance', () => {
      const val = BooleanValue.create__();
      const original = val.asOriginalType__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = BooleanValue.create__();
      const mock = BooleanValue.fromOriginalType2__(val.asOriginalType__());
      expect(mock).toBe(val);
    });
  });
});
