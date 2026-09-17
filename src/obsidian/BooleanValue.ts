/**
 * @file
 *
 * Mock of Obsidian's `BooleanValue`, the Bases value wrapping a boolean.
 */

import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

/**
 * Mock of Obsidian's `BooleanValue`, a Bases `Value` wrapping a boolean.
 */
export class BooleanValue extends PrimitiveValue<boolean> {
  /**
   * Creates a value wrapping a boolean.
   *
   * @param value - The wrapped boolean; `false` when omitted.
   */
  public constructor(value = false) {
    super(value);
    const self = strictProxy(this);
    self.constructor4__(value);
    return self;
  }

  /**
   * Mock-only factory: creates a boolean value, spyable via `vi.spyOn(BooleanValue, 'create__')`.
   *
   * @param value - The wrapped boolean; `false` when omitted.
   * @returns The new boolean value.
   */
  public static create__(value = false): BooleanValue {
    return new BooleanValue(value);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `BooleanValue` as this mock. Numbered to avoid clashing with the
   * variants its base classes declare.
   *
   * @param value - The value typed as the original `BooleanValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: BooleanValueOriginal): BooleanValue {
    return strictProxy(value, BooleanValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `BooleanValue` type. Numbered to avoid clashing with the variants its
   * base classes declare.
   *
   * @returns The same object, typed as the original `BooleanValue`.
   */
  public asOriginalType4__(): BooleanValueOriginal {
    return strictProxy<BooleanValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(BooleanValue.prototype, 'constructor4__')`.
   *
   * @param _value - The boolean the value was created with.
   */
  public constructor4__(_value = false): void {
    noop();
  }
}
