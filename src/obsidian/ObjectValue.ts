/**
 * @file
 *
 * Mock of Obsidian's `ObjectValue`, the Bases value wrapping an object.
 */

import type { ObjectValue as ObjectValueOriginal } from 'obsidian';

// eslint-disable-next-line import-x/no-cycle -- The shared conversion constructs this class, exactly as Obsidian's own does.
import { lazyEvaluate } from '../internal/lazy-evaluator.ts';
import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NullValue } from './NullValue.ts';
import { Value } from './Value.ts';

/**
 * Mock of Obsidian's `ObjectValue`, a Bases value wrapping an object whose properties are `Value`s or raw
 * data. A raw property is converted to a `Value` the first time {@link ObjectValue.get} reads it.
 */
export class ObjectValue extends NotNullValue {
  /**
   * The value type's identifier, `'Object'` - Obsidian's own name for this class of value.
   */
  public static override type = 'Object';

  /**
   * The lucide icon name standing for this value's type.
   *
   * `lucide-list` rather than an object-shaped glyph, which is Obsidian's own choice, not a copy error.
   */
  public override icon = 'lucide-list';

  /**
   * Creates a value wrapping `data`.
   *
   * @param data - The object to wrap, stored as {@link ObjectValue.data}. The object passed in, not a copy.
   */
  public constructor(public data: Record<string, unknown>) {
    super();
    const self = strictProxy(this);
    self.constructor3__(data);
    return self;
  }

  /**
   * Mock-only factory: creates an object value, spyable via `vi.spyOn(ObjectValue, 'create__')`.
   *
   * @param data - The object to wrap.
   * @returns The new object value.
   */
  public static create__(data: Record<string, unknown>): ObjectValue {
    return new ObjectValue(data);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `ObjectValue` as this mock.
   *
   * @param value - The value typed as the original `ObjectValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: ObjectValueOriginal): ObjectValue {
    return strictProxy(value, ObjectValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `ObjectValue` type.
   *
   * @returns The same object, typed as the original `ObjectValue`.
   */
  public asOriginalType3__(): ObjectValueOriginal {
    return strictProxy<ObjectValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(ObjectValue.prototype, 'constructor3__')`.
   *
   * @param _data - The object the value was created with.
   */
  public constructor3__(_data: unknown): void {
    noop();
  }

  /**
   * Compares this object with another, as Obsidian does: key by key, rather than by the two objects'
   * string forms.
   *
   * @param other - The object to compare with.
   * @returns `true` when the two wrap the SAME object; `false` when their key counts differ or a key of
   * this one is missing from the other; otherwise whether every key's value is `Value.equals` to the
   * other's, each side read through {@link ObjectValue.get} so a raw property is converted first.
   * Obsidian walks the keys twice, checking presence and then equality; one walk answers the same.
   */
  public override equals(other: this): boolean {
    if (this.data === other.data) {
      return true;
    }
    const keys = Object.keys(this.data);
    return keys.length === Object.keys(other.data).length
      && keys.every((key) => Object.hasOwn(other.data, key) && Value.equals(this.get(key), other.get(key)));
  }

  /**
   * Looks up the value stored under a key.
   *
   * @param key - The property name to look up.
   * @returns `NullValue.value` when the object has no own property under that key. A `Value` property as
   * it is. Any other property converted by {@link ObjectValue.lazyEvaluator}, which replaces it in
   * {@link ObjectValue.data}.
   */
  public get(key: string): Value {
    if (!Object.hasOwn(this.data, key)) {
      return NullValue.value;
    }
    const property = this.data[key];
    if (property instanceof Value) {
      return property;
    }
    const value = this.lazyEvaluator(key, property);
    this.data[key] = value;
    return value;
  }

  /**
   * Looks up the value stored under a key, ignoring the case of the key.
   *
   * @param key - The property name to look up.
   * @returns The value under the key itself when the object owns it, otherwise the value under the first
   * key that differs from it only in case, and otherwise `NullValue.value`.
   */
  public getInsensitive(key: string): Value {
    return this.get(findKeyInsensitive(this.data, key));
  }

  /**
   * Reports whether the wrapped object has no own enumerable keys.
   *
   * @returns Whether the object has no keys.
   */
  public isEmpty(): boolean {
    return Object.keys(this.data).length === 0;
  }

  /**
   * Reports whether the value counts as true in a Bases formula.
   *
   * @returns Whether the object has at least one key.
   */
  public isTruthy(): boolean {
    return !this.isEmpty();
  }

  /**
   * Lists the property keys {@link ObjectValue.objectAccess} answers for.
   *
   * @returns The wrapped object's own enumerable keys. It REPLACES the inherited list rather than adding to
   * it, as Obsidian's own override does.
   */
  public override keys(): string[] {
    return Object.keys(this.data);
  }

  /**
   * Converts a raw property to a `Value`, as Obsidian's default evaluator does.
   *
   * @param _key - The property's name.
   * @param raw - The raw property.
   * @returns `NullValue.value` for `null`, `undefined` or a function; a `StringValue`, `NumberValue`
   * (`NaN` excluded) or `BooleanValue` for a primitive; a `ListValue` over a copy of an array; a
   * `DateValue` over a copy of a `Date`; and an `ObjectValue` over a shallow copy of any other object.
   * @throws {Error} For any other raw property, such as a `symbol`, a `bigint` or `NaN`.
   */
  public lazyEvaluator(_key: string, raw: unknown): Value {
    return lazyEvaluate(raw);
  }

  /**
   * Reads a named property of the wrapped object.
   *
   * @param key - The property key, matched without regard to case.
   * @returns Whatever {@link ObjectValue.getInsensitive} answers, so an unknown key gives `NullValue.value`
   * rather than the `null` the base answers.
   */
  public override objectAccess(key: string): null | Value {
    return this.getInsensitive(key);
  }

  /**
   * Renders the object as a string.
   *
   * @returns The JSON of an object mapping each own key to the string form of its value, as
   * {@link ObjectValue.get} reads it.
   */
  public toString(): string {
    const stringified: Record<string, string> = {};
    for (const key of Object.keys(this.data)) {
      stringified[key] = this.get(key).toString();
    }
    return JSON.stringify(stringified);
  }

  /**
   * Gets the object's property values as they are stored, without converting them.
   *
   * @returns The raw property values, each still a `Value` or raw data.
   */
  public valuesRaw(): unknown[] {
    return Object.values(this.data);
  }
}

function findKeyInsensitive(data: Record<string, unknown>, key: string): string {
  if (Object.hasOwn(data, key)) {
    return key;
  }
  const lowerCaseKey = key.toLowerCase();
  return Object.keys(data).find((dataKey) => dataKey.toLowerCase() === lowerCaseKey) ?? key;
}
