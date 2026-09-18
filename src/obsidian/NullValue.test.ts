import type { NullValue as NullValueOriginal } from 'obsidian';

import {
  describe,
  expect,
  it
} from 'vitest';

import { NullValue } from './NullValue.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

describe('NullValue', () => {
  it('should create an instance via create__', () => {
    const value = NullValue.create__();
    expect(value).toBeInstanceOf(NullValue);
  });

  it('should return false for isTruthy', () => {
    const value = new NullValue();
    expect(value.isTruthy()).toBe(false);
  });

  it('should return empty string for toString', () => {
    const value = new NullValue();
    expect(String(value)).toBe('');
  });

  describe('equals', () => {
    it('should treat one null as every other null', () => {
      expect(NullValue.value.equals(NullValue.create__())).toBe(true);
      expect(Value.equals(NullValue.value, NullValue.create__())).toBe(true);
    });
  });

  describe('looseEquals', () => {
    it('should answer nothing but another null, which is the base answer', () => {
      expect(NullValue.value.looseEquals(new StringValue(''))).toBe(false);
      expect(Value.looseEquals(NullValue.value, NullValue.create__())).toBe(true);
    });
  });

  describe('value', () => {
    it('should expose a shared NullValue singleton', () => {
      expect(NullValue.value).toBeInstanceOf(NullValue);
    });
  });

  describe('asOriginalType2__', () => {
    it('should return the same instance typed as the original', () => {
      const value = NullValue.create__();
      const original: NullValueOriginal = value.asOriginalType2__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType2__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = NullValue.create__();
      const mock = NullValue.fromOriginalType2__(value.asOriginalType2__());
      expect(mock).toBe(value);
    });
  });
});
