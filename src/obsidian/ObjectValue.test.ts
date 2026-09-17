import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

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

describe('ObjectValue', () => {
  it('should carry the list icon, which is what Obsidian gives an object', () => {
    expect(new ObjectValue({}).icon).toBe('lucide-list');
  });

  describe('keys', () => {
    it('should report the wrapped object\'s own keys, in its own order, instead of the inherited list', () => {
      // Built from ordered entries rather than from a literal, whose keys the formatter would sort.
      const data: Record<string, unknown> = Object.fromEntries([['b', 2], ['a', 1]]);
      expect(new ObjectValue(data).keys()).toEqual(['b', 'a']);
    });

    it('should be empty for an empty object', () => {
      expect(new ObjectValue({}).keys()).toEqual([]);
    });
  });

  describe('objectAccess', () => {
    it('should read a property, ignoring the key\'s case', () => {
      const value = new ObjectValue({ Title: 'note' });
      expect(value.objectAccess('title')?.toString()).toBe('note');
      expect(value.objectAccess('Title')?.toString()).toBe('note');
    });

    it('should answer NullValue rather than null for an unknown key', () => {
      expect(new ObjectValue({}).objectAccess('missing')).toBe(NullValue.value);
    });
  });

  it('should create an instance via create__', () => {
    const value = ObjectValue.create__({});
    expect(value).toBeInstanceOf(ObjectValue);
  });

  it('should store the object passed in, not a copy', () => {
    const data = { a: 'x' };
    expect(new ObjectValue(data).data).toBe(data);
  });

  describe('isTruthy', () => {
    it('should return false for an empty object', () => {
      expect(new ObjectValue({}).isTruthy()).toBe(false);
    });

    it('should return true for a non-empty object', () => {
      expect(new ObjectValue({ a: 'x' }).isTruthy()).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the JSON of an empty object for an empty object', () => {
      expect(String(new ObjectValue({}))).toBe('{}');
    });

    it('should map each key to the string form of its value', () => {
      const value = new ObjectValue({
        flag: true,
        list: [1, 2],
        number: 1,
        text: 'x'
      });
      expect(String(value)).toBe('{"flag":"true","list":"1, 2","number":"1","text":"x"}');
    });
  });

  describe('isEmpty', () => {
    it('should return true for an empty object', () => {
      expect(new ObjectValue({}).isEmpty()).toBe(true);
    });

    it('should return false for a non-empty object', () => {
      expect(new ObjectValue({ a: 'x' }).isEmpty()).toBe(false);
    });
  });

  describe('get', () => {
    it('should return the null value for a key the object does not own', () => {
      expect(new ObjectValue({ a: 'x' }).get('b')).toBe(NullValue.value);
    });

    it('should return the null value for an inherited key', () => {
      expect(new ObjectValue({}).get('toString')).toBe(NullValue.value);
    });

    it('should return a Value property as it is', () => {
      const property = new StringValue('x');
      expect(new ObjectValue({ a: property }).get('a')).toBe(property);
    });

    it('should convert a raw property once and cache it', () => {
      const value = new ObjectValue({ a: 'x' });
      const converted = value.get('a');
      expect(converted).toBeInstanceOf(StringValue);
      expect(value.data['a']).toBe(converted);
      expect(value.get('a')).toBe(converted);
    });
  });

  describe('getInsensitive', () => {
    it('should prefer the key itself', () => {
      const value = new ObjectValue({ KEY: 'upper', key: 'lower' });
      expect(value.getInsensitive('key').toString()).toBe('lower');
    });

    it('should fall back to a key differing only in case', () => {
      const value = new ObjectValue({ Key: 'x' });
      expect(value.getInsensitive('kEy').toString()).toBe('x');
    });

    it('should return the null value when no key matches', () => {
      expect(new ObjectValue({ a: 'x' }).getInsensitive('b')).toBe(NullValue.value);
    });
  });

  describe('lazyEvaluator', () => {
    const value = new ObjectValue({});

    it('should convert primitives to their value types', () => {
      expect(value.lazyEvaluator('a', null)).toBe(NullValue.value);
      expect(value.lazyEvaluator('a', 's')).toBeInstanceOf(StringValue);
      expect(value.lazyEvaluator('a', 1)).toBeInstanceOf(NumberValue);
      expect(value.lazyEvaluator('a', false)).toBeInstanceOf(BooleanValue);
    });

    it('should convert arrays, dates and objects', () => {
      expect(value.lazyEvaluator('a', [1])).toBeInstanceOf(ListValue);
      expect(value.lazyEvaluator('a', new Date())).toBeInstanceOf(DateValue);
      expect(value.lazyEvaluator('a', { b: 1 })).toBeInstanceOf(ObjectValue);
    });

    it('should throw for unsupported raw values', () => {
      expect(() => value.lazyEvaluator('a', NaN)).toThrow('Value type is unsupported NaN');
    });
  });

  describe('valuesRaw', () => {
    it('should return the properties as they are stored', () => {
      const property = new StringValue('b');
      const value = new ObjectValue({ a: 'x', b: property });
      expect(value.valuesRaw()).toEqual(['x', property]);
    });

    it('should return a converted property once it has been read', () => {
      const value = new ObjectValue({ a: 'x' });
      const converted = value.get('a');
      expect(value.valuesRaw()).toEqual([converted]);
    });
  });

  describe('asOriginalType3__', () => {
    it('should return the same instance typed as the original', () => {
      const value = ObjectValue.create__({});
      const original: ObjectValueOriginal = value.asOriginalType3__();
      expect(original).toBe(value);
    });
  });

  describe('fromOriginalType3__', () => {
    it('should return the same instance typed as the mock type', () => {
      const value = ObjectValue.create__({});
      const mock = ObjectValue.fromOriginalType3__(value.asOriginalType3__());
      expect(mock).toBe(value);
    });
  });
});
