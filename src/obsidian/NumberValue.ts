/**
 * @file
 *
 * Mock of Obsidian's `NumberValue`, the Bases value wrapping a number.
 */

import type { NumberValue as NumberValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

/**
 * Mock of Obsidian's `NumberValue`, a Bases value wrapping a number.
 */
export class NumberValue extends PrimitiveValue<number> {
  /**
   * Creates a value wrapping `value`.
   *
   * @param value - The number to wrap; `0` when omitted.
   */
  public constructor(value = 0) {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a number value, spyable via `vi.spyOn(NumberValue, 'create__')`.
   *
   * @param value - The number to wrap; `0` when omitted.
   * @returns The new number value.
   */
  public static create__(value = 0): NumberValue {
    return new NumberValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `NumberValue` as this mock.
   *
   * @param value - The value typed as the original `NumberValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: NumberValueOriginal): NumberValue {
    return strictProxy(value, NumberValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `NumberValue` type.
   *
   * @returns The same object, typed as the original `NumberValue`.
   */
  public asOriginalType4__(): NumberValueOriginal {
    return strictProxy<NumberValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(NumberValue.prototype, 'constructor4__')`.
   *
   * @param _value - The number the value was created with.
   */
  public constructor4__(_value = 0): void {
    noop();
  }
}
