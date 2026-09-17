/**
 * @file
 *
 * Mock of Obsidian's `ListValue`, the Bases value wrapping a list of values.
 */

import type { ListValue as ListValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { NotNullValue } from './NotNullValue.ts';

/**
 * Mock of Obsidian's `ListValue`: a non-null value wrapping an array of values, not necessarily of one type.
 *
 * The elements live in {@link ListValue.values__}, which the constructor does NOT fill: a new list is empty until
 * a test assigns it.
 */
export class ListValue extends NotNullValue {
  /**
   * Mock-only: the list's elements, which every list method reads.
   */
  public values__: Value[] = [];

  /**
   * Creates a list value.
   *
   * @param value - The list's contents; not stored by the mock, which starts with an empty
   * {@link ListValue.values__}.
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- Matches obsidian-typings signature.
  public constructor(value: (unknown | Value)[]) {
    super();
    const self = strictProxy(this);
    self.constructor3__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a list value, spyable via `vi.spyOn(ListValue, 'create__')`.
   *
   * @param value - The list's contents.
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
    const result = ListValue.create__([]);
    result.values__ = [...this.values__, ...other.values__];
    return result;
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
   * Obsidian returns a `NullValue` for an index out of range; the mock throws instead.
   *
   * @param index - The zero-based index.
   * @returns The element at `index`.
   */
  public get(index: number): Value {
    return ensureNonNullable(this.values__[index]);
  }

  /**
   * Tells whether the list contains a value.
   *
   * Obsidian compares loosely; the mock checks for the same `Value` object.
   *
   * @param value - The value to look for.
   * @returns Whether the list contains `value`.
   */
  public includes(value: Value): boolean {
    return this.values__.includes(value);
  }

  /**
   * Tells whether the value counts as true in a Bases formula.
   *
   * @returns Whether the list has at least one element.
   */
  public isTruthy(): boolean {
    return this.values__.length > 0;
  }

  /**
   * Gets the number of elements in the list.
   *
   * @returns The element count.
   */
  public length(): number {
    return this.values__.length;
  }

  /**
   * Renders the list as a string.
   *
   * @returns The elements' strings, joined with `, `.
   */
  public toString(): string {
    return this.values__.map((v) => v.toString()).join(', ');
  }
}
