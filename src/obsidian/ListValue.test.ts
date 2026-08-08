import {
  describe,
  expect,
  it
} from 'vitest';

import { ListValue } from './ListValue.ts';
import { StringValue } from './StringValue.ts';

describe('ListValue', () => {
  it('should default to empty values', () => {
    const value = new ListValue([]);
    expect(value.values__).toEqual([]);
  });

  it('should be falsy when empty', () => {
    const value = new ListValue([]);
    expect(value.isTruthy()).toBe(false);
  });

  it('should be truthy when non-empty', () => {
    const value = new ListValue([]);
    value.values__.push(new StringValue('item'));
    expect(value.isTruthy()).toBe(true);
  });

  it('should join values with comma-space for toString', () => {
    const value = new ListValue([]);
    value.values__.push(new StringValue('a'), new StringValue('b'), new StringValue('c'));
    expect(String(value)).toBe('a, b, c');
  });

  it('should return empty string for toString when empty', () => {
    const value = new ListValue([]);
    expect(String(value)).toBe('');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = ListValue.create__([]);
      expect(value).toBeInstanceOf(ListValue);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const value = ListValue.create__([]);
      const original = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ListValue.create__([]);
      const mock = ListValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });

  describe('length', () => {
    it('should return the number of values', () => {
      const value = new ListValue([]);
      value.values__.push(new StringValue('a'), new StringValue('b'));
      expect(value.length()).toBe(2);
    });
  });

  describe('get', () => {
    it('should return the value at the given index', () => {
      const value = new ListValue([]);
      const item = new StringValue('a');
      value.values__.push(item);
      expect(value.get(0)).toBe(item);
    });
  });

  describe('includes', () => {
    it('should report membership by reference', () => {
      const value = new ListValue([]);
      const item = new StringValue('a');
      value.values__.push(item);
      expect(value.includes(item)).toBe(true);
      expect(value.includes(new StringValue('b'))).toBe(false);
    });
  });

  describe('concat', () => {
    it('should return a new ListValue with both sets of values', () => {
      const a = new ListValue([]);
      a.values__.push(new StringValue('a'));
      const b = new ListValue([]);
      b.values__.push(new StringValue('b'));
      const result = a.concat(b);
      expect(result).toBeInstanceOf(ListValue);
      expect(result.values__).toHaveLength(2);
      expect(String(result)).toBe('a, b');
    });
  });
});
