/**
 * @file
 *
 * Mock of Obsidian's `NotNullValue`, the base of every Bases value that is not null.
 */

import type { NotNullValue as NotNullValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { Value } from './Value.ts';

/**
 * Mock of Obsidian's `NotNullValue`, the abstract base type for all non-null Bases values.
 */
export abstract class NotNullValue extends Value {
  /**
   * Initializes the non-null value base.
   */
  public constructor() {
    super();
    const self = strictProxy(this);
    self.constructor2__();
    return self;
  }

  /**
   * Mock-only: views a value typed as Obsidian's `NotNullValue` as this mock.
   *
   * @param value - The value typed as the original `NotNullValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType2__(value: NotNullValueOriginal): NotNullValue {
    return strictProxy(value, NotNullValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `NotNullValue` type.
   *
   * @returns The same object, typed as the original `NotNullValue`.
   */
  public asOriginalType2__(): NotNullValueOriginal {
    return strictProxy<NotNullValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(NotNullValue.prototype, 'constructor2__')`.
   */
  public constructor2__(): void {
    noop();
  }
}
