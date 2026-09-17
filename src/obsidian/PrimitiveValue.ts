/**
 * @file
 *
 * Mock of Obsidian's `PrimitiveValue`, the base of Bases values that wrap a single primitive.
 */

import type { PrimitiveValue as PrimitiveValueOriginal } from 'obsidian';

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
   * Mock-only: the wrapped primitive.
   */
  public value__: T;

  /**
   * Creates a value wrapping `value`.
   *
   * @param value - The primitive to wrap.
   */
  public constructor(value: T) {
    super();
    this.value__ = value;
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
    return strictProxy<PrimitiveValue<T>>(value);
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
   * Reports whether the value counts as true in a condition, by JavaScript truthiness of the wrapped primitive.
   *
   * @returns Whether the wrapped primitive is truthy.
   */
  public isTruthy(): boolean {
    return !!this.value__;
  }

  /**
   * Converts the value to its display string.
   *
   * @returns The wrapped primitive converted with `String`.
   */
  public toString(): string {
    return String(this.value__);
  }
}
