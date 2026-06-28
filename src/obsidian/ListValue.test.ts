import {
  describe,
  expect,
  it
} from 'vitest';

import { ListValue } from './ListValue.ts';
import { StringValue } from './StringValue.ts';

describe('ListValue', () => {
  it('should default to empty values', () => {
    const val = new ListValue([]);
    expect(val.values__).toEqual([]);
  });

  it('should be falsy when empty', () => {
    const val = new ListValue([]);
    expect(val.isTruthy()).toBe(false);
  });

  it('should be truthy when non-empty', () => {
    const val = new ListValue([]);
    val.values__.push(new StringValue('item'));
    expect(val.isTruthy()).toBe(true);
  });

  it('should join values with comma-space for toString', () => {
    const val = new ListValue([]);
    val.values__.push(new StringValue('a'), new StringValue('b'), new StringValue('c'));
    expect(String(val)).toBe('a, b, c');
  });

  it('should return empty string for toString when empty', () => {
    const val = new ListValue([]);
    expect(String(val)).toBe('');
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const val = ListValue.create__([]);
      expect(val).toBeInstanceOf(ListValue);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance', () => {
      const val = ListValue.create__([]);
      const original = val.asOriginalType3__();
      expect(original).toBe(val);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const val = ListValue.create__([]);
      const mock = ListValue.fromOriginalType3__(val.asOriginalType3__());
      expect(mock).toBe(val);
    });
  });

  describe('length', () => {
    it('should return the number of values', () => {
      const val = new ListValue([]);
      val.values__.push(new StringValue('a'), new StringValue('b'));
      expect(val.length()).toBe(2);
    });
  });

  describe('get', () => {
    it('should return the value at the given index', () => {
      const val = new ListValue([]);
      const item = new StringValue('a');
      val.values__.push(item);
      expect(val.get(0)).toBe(item);
    });
  });

  describe('includes', () => {
    it('should report membership by reference', () => {
      const val = new ListValue([]);
      const item = new StringValue('a');
      val.values__.push(item);
      expect(val.includes(item)).toBe(true);
      expect(val.includes(new StringValue('b'))).toBe(false);
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
