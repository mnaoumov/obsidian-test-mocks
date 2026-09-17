/**
 * @file
 *
 * Mock of Obsidian's `ListValue`, the Bases value wrapping a list of values.
 */

import type { ListValue as ListValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { BooleanValue } from './BooleanValue.ts';
import { DateValue } from './DateValue.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NullValue } from './NullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { ObjectValue } from './ObjectValue.ts';
import { StringValue } from './StringValue.ts';
import { Value } from './Value.ts';

/**
 * Mock of Obsidian's `ListValue`: a non-null value wrapping an array whose elements are `Value`s or raw data, not
 * necessarily of one type. A raw element is converted to a `Value` the first time {@link ListValue.get} reads it.
 */
export class ListValue extends NotNullValue {
  /**
   * The list's elements, each a `Value` or raw data not yet converted. The array passed to the constructor, not a
   * copy.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public data: (unknown | Value)[];

  /**
   * Creates a list value.
   *
   * @param value - The list's elements, stored as {@link ListValue.data}.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor(value: (unknown | Value)[]) {
    super();
    this.data = value;
    const self = strictProxy(this);
    self.constructor3__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a list value, spyable via `vi.spyOn(ListValue, 'create__')`.
   *
   * @param value - The list's elements.
   * @returns The new list value.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public static create__(value: (unknown | Value)[]): ListValue {
    return new ListValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ListValue` as this mock.
   *
   * @param value - The value typed as the original `ListValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ListValueOriginal): ListValue {
    return strictProxy(value, ListValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ListValue` type.
   *
   * @returns The same object, typed as the original `ListValue`.
   */
  public asOriginalType3__(): ListValueOriginal {
    return strictProxy<ListValueOriginal>(this);
  }

  /**
   * Joins this list with another.
   *
   * @param other - The list whose elements come second.
   * @returns A new list holding this list's elements followed by `other`'s.
   */
  public concat(other: ListValue): ListValue {
    return ListValue.create__([...this.data, ...other.data]);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ListValue.prototype, 'constructor3__')`.
   *
   * @param _value - The contents the list was created with.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor3__(_value: (unknown | Value)[]): void {
    noop();
  }

  /**
   * Gets the element at an index.
   *
   * @param index - The zero-based index.
   * @returns `NullValue.value` when the index is out of range or the element is `null` or `undefined`. A `Value`
   * element as it is. Any other element converted by {@link ListValue.lazyEvaluator}, which replaces it in
   * {@link ListValue.data}.
   */
  public get(index: number): Value {
    const element = this.data[index];
    if (element === null || element === undefined) {
      return NullValue.value;
    }
    if (element instanceof Value) {
      return element;
    }
    const value = this.lazyEvaluator(index, element);
    this.data[index] = value;
    return value;
  }

  /**
   * Tells whether the list contains a value.
   *
   * @param value - The value to look for.
   * @returns Whether `Value.looseEquals` holds between `value` and any element.
   */
  public includes(value: Value): boolean {
    for (let index = 0; index < this.data.length; index++) {
      if (Value.looseEquals(value, this.get(index))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Tells whether the value counts as true in a Bases formula.
   *
   * @returns Whether the list has at least one element.
   */
  public isTruthy(): boolean {
    return this.data.length > 0;
  }

  /**
   * Joins the elements' text.
   *
   * @param separator - The text between two elements.
   * @returns A string value of the joined elements. A raw string, boolean or number is written with `String`; any
   * other element is read through {@link ListValue.get} and written with its `toString`.
   */
  public join(separator: string): StringValue {
    const parts = this.data.map((element, index) =>
      typeof element === 'string' || typeof element === 'boolean' || (typeof element === 'number' && !Number.isNaN(element))
        ? String(element)
        : this.get(index).toString()
    );
    return StringValue.create__(parts.join(separator));
  }

  /**
   * Converts a raw element to a `Value`, as Obsidian's default evaluator does.
   *
   * @param _index - The element's index.
   * @param raw - The raw element.
   * @returns `NullValue.value` for `null`, `undefined` or a function; a `StringValue`, `NumberValue` (`NaN`
   * excluded) or `BooleanValue` for a primitive; a `ListValue` over a copy of an array; a `DateValue` over a copy of
   * a `Date`; and an `ObjectValue` over a shallow copy of any other object.
   * @throws {Error} For any other raw value, such as a `symbol`, a `bigint` or `NaN`.
   */
  public lazyEvaluator(_index: number, raw: unknown): Value {
    if (raw === null || raw === undefined || typeof raw === 'function') {
      return NullValue.value;
    }
    if (typeof raw === 'string') {
      return StringValue.create__(raw);
    }
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
      return NumberValue.create__(raw);
    }
    if (typeof raw === 'boolean') {
      return BooleanValue.create__(raw);
    }
    if (Array.isArray(raw)) {
      return ListValue.create__([...raw]);
    }
    if (raw instanceof Date) {
      return DateValue.create__(new Date(raw));
    }
    if (typeof raw === 'object') {
      return ObjectValue.create__({ ...raw });
    }
    // eslint-disable-next-line @typescript-eslint/no-base-to-string -- Only a symbol, a bigint or NaN reaches this line.
    throw new Error(`Value type is unsupported ${String(raw)}`);
  }

  /**
   * Gets the number of elements in the list.
   *
   * @returns The element count.
   */
  public length(): number {
    return this.data.length;
  }

  /**
   * Renders the list as a string.
   *
   * @returns The elements joined with `, `, as {@link ListValue.join} writes them.
   */
  public toString(): string {
    return this.join(', ').value__;
  }
}
