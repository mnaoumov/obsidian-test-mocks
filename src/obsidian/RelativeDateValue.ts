/**
 * @file
 *
 * Mock of Obsidian's `RelativeDateValue`, a Bases date value rendered relative to now.
 */

import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { DateValue } from './DateValue.ts';

/**
 * Mock of Obsidian's `RelativeDateValue`, which behaves like a `DateValue` but renders as a time relative to now.
 */
export class RelativeDateValue extends DateValue {
  /**
   * Creates a value wrapping `date`.
   *
   * @param date - The date to wrap.
   * @param showTime - Whether the time portion is shown.
   */
  public constructor(date: Date, showTime?: boolean) {
    super(date, showTime);
    const self = strictProxy(this);
    self.constructor4__(date, showTime);
    return self;
  }

  /**
   * Mock-only factory: creates a relative date value, spyable via `vi.spyOn(RelativeDateValue, 'create2__')`.
   * It is the subclass variant of `DateValue`'s factory.
   *
   * @param date - The date to wrap.
   * @param showTime - Whether the time portion is shown.
   * @returns The new relative date value.
   */
  public static create2__(date: Date, showTime?: boolean): RelativeDateValue {
    return new RelativeDateValue(date, showTime);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `RelativeDateValue` as this mock.
   *
   * @param value - The value typed as the original `RelativeDateValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType4__(value: RelativeDateValueOriginal): RelativeDateValue {
    return strictProxy(value, RelativeDateValue);
  }

  /**
   * Mock-only: views this mock as Obsidian's `RelativeDateValue` type.
   *
   * @returns The same object, typed as the original `RelativeDateValue`.
   */
  public asOriginalType4__(): RelativeDateValueOriginal {
    return strictProxy<RelativeDateValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(RelativeDateValue.prototype, 'constructor4__')`.
   *
   * @param _date - The date the value was created with.
   * @param _showTime - Whether the time portion was requested.
   */
  public constructor4__(_date: unknown, _showTime?: boolean): void {
    noop();
  }
}
