/**
 * @file
 *
 * Mock of Obsidian's `ObjectValue`, the Bases value wrapping an object.
 */

import type {
  ObjectValue as ObjectValueOriginal,
  Value as ValueOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

/**
 * Mock of Obsidian's `ObjectValue`, a Bases value wrapping an object.
 *
 * The mock keeps the wrapped data only to answer {@link ObjectValue.isEmpty}; key lookups are not implemented.
 */
export class ObjectValue extends NotNullValue {
  /**
   * Creates a value wrapping `data`.
   *
   * @param data - The object to wrap.
   */
  public constructor(private readonly data: unknown) {
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
  public static create__(data: unknown): ObjectValue {
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
   * Looks up the value stored under a key. Obsidian returns it wrapped as a `Value` (or `NullValue` when absent);
   * the mock does not implement lookups.
   *
   * @param _key - The property name to look up.
   * @returns Always `null` in the mock.
   */
  public get(_key: string): null | ValueOriginal {
    return null;
  }

  /**
   * Reports whether the wrapped object has no own enumerable keys.
   *
   * @returns `true` when the data is not an object, is `null`, or has no keys.
   */
  public isEmpty(): boolean {
    return typeof this.data !== 'object' || this.data === null || Object.keys(this.data).length === 0;
  }

  /**
   * Reports whether the value counts as true in a condition; an object always does.
   *
   * @returns Always `true`.
   */
  public isTruthy(): boolean {
    return true;
  }

  /**
   * Converts the value to its display string.
   *
   * @returns Always an empty string in the mock.
   */
  public toString(): string {
    return '';
  }
}
