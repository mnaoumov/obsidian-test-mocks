import {
  describe,
  expect,
  it,
  vi
} from 'vitest';

import { BooleanValue } from './BooleanValue.ts';
import { DateValue } from './DateValue.ts';
import { ListValue } from './ListValue.ts';
import { NullValue } from './NullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { ObjectValue } from './ObjectValue.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

describe('ListValue', () => {
  it('should carry the list icon', () => {
    expect(new ListValue([]).icon).toBe('lucide-list');
  });

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

  describe('keys', () => {
    it('should add length to the inherited keys', () => {
      expect(new ListValue(['a']).keys()).toEqual(['length']);
    });
  });

  describe('objectAccess', () => {
    it('should answer the element count, whatever the key\'s case', () => {
      const value = new ListValue(['a', 'b']);
      expect(value.objectAccess('length')).toBeInstanceOf(NumberValue);
      expect(value.objectAccess('length')?.toString()).toBe('2');
      expect(value.objectAccess('Length')?.toString()).toBe('2');
    });

    it('should answer null for any other key', () => {
      expect(new ListValue(['a']).objectAccess('size')).toBeNull();
    });
  });

  describe('compare', () => {
    it('should short-circuit when both lists share one array', () => {
      const data = ['a'];
      const comparator = vi.fn(() => false);
      expect(new ListValue(data).compare(new ListValue(data), comparator)).toBe(true);
      expect(comparator).not.toHaveBeenCalled();
    });

    it('should return false when the lengths differ', () => {
      expect(new ListValue(['a']).compare(new ListValue(['a', 'b']), () => true)).toBe(false);
    });

    it('should skip the comparator for elements that are the same raw element', () => {
      const shared = new StringValue('a');
      const comparator = vi.fn(() => false);
      expect(new ListValue([shared]).compare(new ListValue([shared]), comparator)).toBe(true);
      expect(comparator).not.toHaveBeenCalled();
    });

    it('should hand the comparator the converted elements and honour its answer', () => {
      const comparator = vi.fn(() => true);
      expect(new ListValue(['a']).compare(new ListValue(['b']), comparator)).toBe(true);
      expect(comparator).toHaveBeenCalledWith(expect.any(StringValue), expect.any(StringValue));
      expect(new ListValue(['a']).compare(new ListValue(['b']), () => false)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should compare element by element rather than by the lists string forms', () => {
      expect(new ListValue([1, 2]).equals(new ListValue([1, 2]))).toBe(true);
      expect(new ListValue([1, 2]).equals(new ListValue([1, 3]))).toBe(false);
      expect(new ListValue(['1, 2']).equals(new ListValue([1, 2]))).toBe(false);
    });
  });

  describe('looseEquals', () => {
    it('should compare element by element against another list', () => {
      expect(new ListValue([1]).looseEquals(new ListValue(['1']))).toBe(true);
      expect(new ListValue([1, 2]).looseEquals(new ListValue([1]))).toBe(false);
    });

    it('should unwrap a one-element list against a non-list value', () => {
      expect(new ListValue([1]).looseEquals(new NumberValue(1))).toBe(true);
      expect(new ListValue([1]).looseEquals(new NumberValue(2))).toBe(false);
    });

    it('should never equal a non-list value when it holds anything but one element', () => {
      expect(new ListValue([1, 2]).looseEquals(new NumberValue(1))).toBe(false);
      expect(new ListValue([]).looseEquals(NullValue.value)).toBe(false);
    });
  });

  describe('getNumbers', () => {
    it('should collect raw numbers and NumberValues, and nothing else', () => {
      const value = new ListValue([1, new NumberValue(2), '3', new StringValue('4'), NaN, null, true]);
      expect(value.getNumbers()).toEqual([1, 2]);
    });

    it('should not convert or cache anything', () => {
      const value = new ListValue(['3']);
      value.getNumbers();
      expect(value.data[0]).toBe('3');
    });
  });

  describe('getDates', () => {
    it('should parse raw strings and StringValues, and take a DateValue as it is', () => {
      const dateValue = DateValue.create__(new Date(2020, 0, 2));
      const value = new ListValue([
        '2026-09-17',
        new StringValue('2026-01-02T03:04:05'),
        dateValue,
        'not a date',
        1,
        new NumberValue(2)
      ]);
      const dates = value.getDates();
      expect(dates).toHaveLength(3);
      expect(dates[0]).toEqual(new Date('2026-09-17T00:00:00'));
      expect(dates[1]).toEqual(new Date('2026-01-02T03:04:05'));
      expect(dates[2]).toBe(dateValue.date);
    });

    it('should not convert or cache anything', () => {
      const value = new ListValue(['2026-09-17']);
      value.getDates();
      expect(value.data[0]).toBe('2026-09-17');
    });
  });

  describe('earliest and latest', () => {
    it('should answer the extreme dates as DateValues carrying their time', () => {
      const value = new ListValue(['2026-01-02T03:04:05', '2024-01-01', '2026-09-17']);
      const earliest = value.earliest() as DateValue;
      const latest = value.latest() as DateValue;
      expect(earliest).toBeInstanceOf(DateValue);
      expect(earliest.date).toEqual(new Date('2024-01-01T00:00:00'));
      expect(earliest.time).toBe(true);
      expect(latest).toBeInstanceOf(DateValue);
      expect(latest.date).toEqual(new Date('2026-09-17T00:00:00'));
    });

    it('should answer NullValue when the list holds no date', () => {
      const value = new ListValue([1, 'not a date']);
      expect(value.earliest()).toBe(NullValue.value);
      expect(value.latest()).toBe(NullValue.value);
    });
  });

  describe('sum', () => {
    it('should add the numbers up', () => {
      expect(new ListValue([1, new NumberValue(2), 'x']).sum().toString()).toBe('3');
    });

    it('should answer NullValue when the list holds no number', () => {
      expect(new ListValue(['x']).sum()).toBe(NullValue.value);
    });
  });

  describe('mean', () => {
    it('should divide by the WHOLE list length, not by the count of numbers', () => {
      expect(new ListValue([1, 2, 3]).mean().toString()).toBe('2');
      expect(new ListValue([1, 2, 3, 'x']).mean().toString()).toBe('1.5');
    });

    it('should answer NullValue when the list holds no number', () => {
      expect(new ListValue(['x']).mean()).toBe(NullValue.value);
    });
  });

  describe('median', () => {
    it('should answer the middle number of an odd count', () => {
      expect(new ListValue([3, 1, 2]).median().toString()).toBe('2');
    });

    it('should average the middle two of an even count', () => {
      expect(new ListValue([4, 1, 2, 3]).median().toString()).toBe('2.5');
    });

    it('should answer NullValue when the list holds no number', () => {
      expect(new ListValue(['x']).median()).toBe(NullValue.value);
    });
  });

  describe('min and max', () => {
    it('should answer the extreme numbers', () => {
      const value = new ListValue([3, new NumberValue(-1), 2, 'x']);
      expect(value.min().toString()).toBe('-1');
      expect(value.max().toString()).toBe('3');
    });

    it('should answer NullValue when the list holds no number', () => {
      expect(new ListValue(['x']).min()).toBe(NullValue.value);
      expect(new ListValue(['x']).max()).toBe(NullValue.value);
    });
  });

  describe('stddev', () => {
    it('should answer the population standard deviation', () => {
      expect(new ListValue([2, 4, 4, 4, 5, 5, 7, 9]).stddev().toString()).toBe('2');
    });

    it('should answer zero for a single number', () => {
      expect(new ListValue([5]).stddev().toString()).toBe('0');
    });

    it('should answer NullValue when the list holds no number', () => {
      expect(new ListValue(['x']).stddev()).toBe(NullValue.value);
    });
  });

  describe('slice', () => {
    it('should take a run of the elements without touching the list', () => {
      const value = new ListValue(['a', 'b', 'c']);
      expect(value.slice(1).data).toEqual(['b', 'c']);
      expect(value.slice(1, 2).data).toEqual(['b']);
      // eslint-disable-next-line unicorn/prefer-spread -- This is `ListValue.slice`, which answers a new `ListValue`; a spread would answer a plain array instead.
      expect(value.slice().data).toEqual(['a', 'b', 'c']);
      expect(value.slice(-1).data).toEqual(['c']);
      expect(value.data).toEqual(['a', 'b', 'c']);
    });
  });

  describe('reverse', () => {
    it('should answer a new list in the opposite order, leaving this one alone', () => {
      const value = new ListValue(['a', 'b', 'c']);
      const reversed = value.reverse();
      expect(reversed).toBeInstanceOf(ListValue);
      expect(reversed.data).toEqual(['c', 'b', 'a']);
      expect(value.data).toEqual(['a', 'b', 'c']);
    });
  });

  describe('flatten', () => {
    it('should inline nested lists and nested raw arrays, recursively', () => {
      const value = new ListValue([1, [2, [3]], new ListValue([4, new ListValue([5])]), 'a']);
      expect(value.flatten().data).toEqual([1, 2, 3, 4, 5, 'a']);
    });

    it('should leave a flat list as it is', () => {
      expect(new ListValue([1, 'a']).flatten().data).toEqual([1, 'a']);
    });
  });

  describe('sort', () => {
    it('should compare two numbers numerically', () => {
      expect(new ListValue([10, 9, 2, new NumberValue(1)]).sort().data).toEqual([
        new NumberValue(1),
        2,
        9,
        10
      ]);
    });

    it('should compare anything else through the collator, ignoring case and ordering digits numerically', () => {
      const value = new ListValue(['item 10', 'item 9', new StringValue('Item 2')]);
      expect(String(value.sort())).toBe('Item 2, item 9, item 10');
    });

    it('should sort a non-primitive value by its string form', () => {
      const nested = new ListValue(['b']);
      expect(new ListValue([nested, 'a']).sort().data).toEqual(['a', nested]);
    });

    it('should leave this list alone', () => {
      const value = new ListValue([2, 1]);
      value.sort();
      expect(value.data).toEqual([2, 1]);
    });
  });

  describe('unique', () => {
    it('should drop the duplicates and answer converted elements', () => {
      const value = new ListValue([1, 'b', 1, 'a', 2]);
      const unique = value.unique();
      expect(unique.data).toEqual([
        new NumberValue(1),
        new NumberValue(2),
        new StringValue('b'),
        new StringValue('a')
      ]);
    });

    it('should read the buckets back in key order, so integer-like forms come first', () => {
      expect(String(new ListValue(['b', 2, 'a', 1]).unique())).toBe('1, 2, b, a');
    });

    // The mock's `Value.equals` compares string forms, so no two real values can share a bucket key and
    // still be unequal; Obsidian's compares constructors first, where a string `1` and a number `1` do.
    it('should keep two elements that share a string form but are not equal', () => {
      const equalsSpy = vi.spyOn(Value, 'equals').mockReturnValue(false);
      try {
        const value = new ListValue([new StringValue('1'), new NumberValue(1)]);
        expect(value.unique().data).toHaveLength(2);
      } finally {
        equalsSpy.mockRestore();
      }
    });

    it('should not be confused by a key that names an Object.prototype member', () => {
      expect(String(new ListValue(['toString', 'toString', 'a']).unique())).toBe('toString, a');
    });
  });
});
