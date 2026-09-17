import {
  describe,
  expect,
  it
} from 'vitest';

import { BooleanValue } from './BooleanValue.ts';
import { DateValue } from './DateValue.ts';
import { ListValue } from './ListValue.ts';
import { NullValue } from './NullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { ObjectValue } from './ObjectValue.ts';
import { StringValue } from './StringValue.ts';

describe('ListValue', () => {
  it('should store the given array as its data', () => {
    const data = [new StringValue('a'), 'b'];
    const value = new ListValue(data);
    expect(value.data).toBe(data);
  });

  it('should be falsy when empty', () => {
    const value = new ListValue([]);
    expect(value.isTruthy()).toBe(false);
  });

  it('should be truthy when non-empty', () => {
    const value = new ListValue([null]);
    expect(value.isTruthy()).toBe(true);
  });

  describe('toString', () => {
    it('should join values and raw elements with comma-space', () => {
      const value = new ListValue([new StringValue('a'), 'b', 1, true, null, [2, 3]]);
      expect(String(value)).toBe('a, b, 1, true, , 2, 3');
    });

    it('should return empty string when empty', () => {
      const value = new ListValue([]);
      expect(String(value)).toBe('');
    });
  });

  describe('join', () => {
    it('should return a string value joined with the separator', () => {
      const result = new ListValue(['a', new NumberValue(2)]).join('|');
      expect(result).toBeInstanceOf(StringValue);
      expect(result.value__).toBe('a|2');
    });
  });

  describe('create__', () => {
    it('should create an instance via factory method', () => {
      const value = ListValue.create__(['a']);
      expect(value).toBeInstanceOf(ListValue);
      expect(value.length()).toBe(1);
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
    it('should return the number of elements', () => {
      const value = new ListValue([new StringValue('a'), 'b']);
      expect(value.length()).toBe(2);
    });
  });

  describe('get', () => {
    it('should return a Value element as it is', () => {
      const item = new StringValue('a');
      const value = new ListValue([item]);
      expect(value.get(0)).toBe(item);
    });

    it('should return NullValue.value out of range and for null or undefined elements', () => {
      const value = new ListValue([null, undefined]);
      expect(value.get(0)).toBe(NullValue.value);
      expect(value.get(1)).toBe(NullValue.value);
      expect(value.get(2)).toBe(NullValue.value);
      expect(value.get(-1)).toBe(NullValue.value);
    });

    it('should convert a raw element once and cache it in data', () => {
      const value = new ListValue(['a']);
      const first = value.get(0);
      expect(first).toBeInstanceOf(StringValue);
      expect(value.data[0]).toBe(first);
      expect(value.get(0)).toBe(first);
    });
  });

  describe('lazyEvaluator', () => {
    const list = new ListValue([]);

    it('should convert primitives to their value types', () => {
      expect(list.lazyEvaluator(0, null)).toBe(NullValue.value);
      expect(list.lazyEvaluator(0, undefined)).toBe(NullValue.value);
      expect(list.lazyEvaluator(0, () => 0)).toBe(NullValue.value);
      expect(list.lazyEvaluator(0, 's')).toBeInstanceOf(StringValue);
      expect(list.lazyEvaluator(0, 1)).toBeInstanceOf(NumberValue);
      expect(list.lazyEvaluator(0, false)).toBeInstanceOf(BooleanValue);
    });

    it('should copy arrays, dates and objects', () => {
      const array = [1];
      const nested = list.lazyEvaluator(0, array);
      expect(nested).toBeInstanceOf(ListValue);
      expect((nested as ListValue).data).not.toBe(array);
      expect((nested as ListValue).data).toEqual(array);

      const date = new Date();
      const dateValue = list.lazyEvaluator(0, date) as DateValue;
      expect(dateValue).toBeInstanceOf(DateValue);
      expect(dateValue.date).not.toBe(date);
      expect(dateValue.date.getTime()).toBe(date.getTime());
      expect(dateValue.time).toBe(true);

      expect(list.lazyEvaluator(0, { a: 1 })).toBeInstanceOf(ObjectValue);
    });

    it('should throw for unsupported raw values', () => {
      expect(() => list.lazyEvaluator(0, NaN)).toThrow('Value type is unsupported NaN');
      expect(() => list.lazyEvaluator(0, Symbol('s'))).toThrow('Value type is unsupported Symbol(s)');
    });
  });

  describe('includes', () => {
    it('should compare loosely against every element', () => {
      const value = new ListValue(['a', new StringValue('b')]);
      expect(value.includes(new StringValue('a'))).toBe(true);
      expect(value.includes(new StringValue('b'))).toBe(true);
      expect(value.includes(new StringValue('c'))).toBe(false);
    });
  });

  describe('concat', () => {
    it('should return a new ListValue over both lists data', () => {
      const a = new ListValue([new StringValue('a')]);
      const b = new ListValue(['b']);
      const result = a.concat(b);
      expect(result).toBeInstanceOf(ListValue);
      expect(result).not.toBe(a);
      expect(result.data).toHaveLength(2);
      expect(String(result)).toBe('a, b');
    });
  });
});
