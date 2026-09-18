/**
 * @file
 *
 * Mock of Obsidian's `PrimitiveValue`, the base of Bases values that wrap a single primitive.
 */

import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

/**
 * Mock of Obsidian's `PrimitiveValue`, the abstract base type for Bases values wrapping a single primitive.
 *
 * @typeParam T - The type of the wrapped primitive.
 */
export abstract class PrimitiveValue<T> extends NotNullValue {
  /**
   * The wrapped primitive. Obsidian's own name for it, which is why this carries no `__` suffix (L4).
   */
  public data: T;

  /**
   * Creates a value wrapping `value`.
   *
   * @param value - The primitive to wrap.
   */
  public constructor(value: T) {
    super();
    this.data = value;
    const self = strictProxy(this);
    self.constructor3__(value);
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `PrimitiveValue` as this mock.
   *
   * @typeParam T - The type of the wrapped primitive.
   * @param value - The value typed as the original `PrimitiveValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__<T>(value: PrimitiveValueOriginal<T>): PrimitiveValue<T> {
    return strictProxy<PrimitiveValue<T>>(value, PrimitiveValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `PrimitiveValue` type.
   *
   * @returns The same object, typed as the original `PrimitiveValue`.
   */
  public asOriginalType3__(): PrimitiveValueOriginal<T> {
    return strictProxy<PrimitiveValueOriginal<T>>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(PrimitiveValue.prototype, 'constructor3__')`.
   *
   * @param _value - The primitive the value was created with.
   */
  public constructor3__(_value: T): void {
    noop();
  }

  /**
   * Compares this value with another of the same type, as Obsidian does: by strict equality of the wrapped
   * primitives.
   *
   * @param other - The value to compare with.
   * @returns Whether the two wrapped primitives are strictly equal.
   */
  public override equals(other: this): boolean {
    return this.data === other.data;
  }

  /**
   * Reports whether the value counts as true in a condition, by JavaScript truthiness of the wrapped primitive.
   *
   * @returns Whether the wrapped primitive is truthy.
   */
  public isTruthy(): boolean {
    return !!this.data;
  }

  /**
   * Loosely compares this value with a value of any type, as Obsidian does: any other primitive value whose
   * wrapped primitive is LOOSELY equal to this one. The `==` is Obsidian's own and is the whole point of the
   * override - it is what makes `BooleanValue(true)` loosely equal `NumberValue(1)` and `StringValue('1')`.
   *
   * @param other - The value to compare with.
   * @returns Whether `other` is a primitive value wrapping a loosely equal primitive.
   */
  public override looseEquals(other: Value): boolean {
    // eslint-disable-next-line eqeqeq -- Obsidian's own loose comparison; a strict one would defeat the method.
    return other instanceof PrimitiveValue && this.data == other.data;
  }

  /**
   * Converts the value to its display string.
   *
   * @returns The wrapped primitive converted with `String`.
   */
  public toString(): string {
    return String(this.data);
  }
}
