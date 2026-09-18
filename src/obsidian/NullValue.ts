/**
 * @file
 *
 * Mock of Obsidian's `NullValue`, the Bases value that represents null.
 */

import type { NullValue as NullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Value } from './Value.ts';

/**
 * Mock of Obsidian's `NullValue`, the Bases value that represents null.
 *
 * Obsidian treats it as a singleton: use {@link NullValue.value} instead of calling the constructor.
 */
export class NullValue extends Value {
  /**
   * The shared null value instance.
   */
  public static value: NullValue = NullValue.create__();

  /**
   * Creates a null value. Prefer the shared {@link NullValue.value}.
   */
  public constructor() {
    super();
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  /**
   * Mock-only factory: creates a null value, spyable via `vi.spyOn(NullValue, 'create__')`.
   *
   * @returns The new null value.
   */
  public static create__(): NullValue {
    return new NullValue();
  }

  /**
   * Mock-only: views a value typed as Obsidian's `NullValue` as this mock.
   *
   * @param value - The value typed as the original `NullValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: NullValueOriginal): NullValue {
    return strictProxy(value, NullValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `NullValue` type.
   *
   * @returns The same object, typed as the original `NullValue`.
   */
  public asOriginalType2__(): NullValueOriginal {
    return strictProxy<NullValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(NullValue.prototype, 'constructor2__')`.
   */
  public constructor2__(): void {
    noop();
  }

  /**
   * Compares this value with another null value, as Obsidian does.
   *
   * @param _other - The value to compare with; only another `NullValue` ever reaches here, because
   * {@link Value.equals}'s class test runs first.
   * @returns Always `true`: one null is every other null.
   */
  public override equals(_other: this): boolean {
    return true;
  }

  /**
   * Reports whether the value counts as true in a condition; null never does.
   *
   * @returns Always `false`.
   */
  public isTruthy(): boolean {
    return false;
  }

  /**
   * Converts the value to its display string.
   *
   * @returns Always an empty string.
   */
  public toString(): string {
    return '';
  }
}
