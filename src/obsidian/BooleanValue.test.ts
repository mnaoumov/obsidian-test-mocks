import {
  describe,
  expect,
  it
} from 'vitest';

import { BooleanValue } from './BooleanValue.ts';

describe('BooleanValue', () => {
  it('should default to false', () => {
    const value = new BooleanValue();
    expect(value.value__).toBe(false);
  });

  it('should accept a value', () => {
    const value = new BooleanValue(true);
    expect(value.value__).toBe(true);
  });

  it('should return false for isTruthy when false', () => {
    const value = new BooleanValue(false);
    expect(value.isTruthy()).toBe(false);
  });

  it('should return true for isTruthy when true', () => {
    const value = new BooleanValue(true);
    expect(value.isTruthy()).toBe(true);
  });

  it('should return "false" for toString when false', () => {
    const value = new BooleanValue(false);
    expect(String(value)).toBe('false');
  });

  it('should return "true" for toString when true', () => {
    const value = new BooleanValue(true);
    expect(String(value)).toBe('true');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = BooleanValue.create__();
      expect(value).toBeInstanceOf(BooleanValue);
      expect(value.value__).toBe(false);
    });

    it('should create an instance with value via factory method', () => {
      const value = BooleanValue.create__(true);
      expect(value.value__).toBe(true);
    });
  });

  describe('asOriginalType4__', () => {
    it('should return the same instance', () => {
      const value = BooleanValue.create__();
      const original = value.asOriginalType4__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType4__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = BooleanValue.create__();
      const mock = BooleanValue.fromOriginalType4__(value.asOriginalType4__());
      expect(mock).toBe(value);
    });
  });
});
