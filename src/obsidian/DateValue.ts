/**
 * @file
 *
 * Mock of Obsidian's `DateValue`, the Bases value wrapping a date.
 */

import type { DateValue as DateValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';
import { moment } from './vars/moment.ts';

/**
 * Mock of Obsidian's `DateValue`, a Bases `Value` wrapping a `Date`, optionally with its time of day.
 */
export class DateValue extends NotNullValue {
  /**
   * Creates a value wrapping a date.
   *
   * @param date - The wrapped date.
   * @param showTime - Whether the time of day is part of the value, and so of {@link DateValue.toString}.
   */
  public constructor(private readonly date: Date, private readonly showTime?: boolean) {
    super();
    const self = strictProxy(this);
    self.constructor3__(date, showTime);
    return self;
  }

  /**
   * Mock-only factory: creates a date value, spyable via `vi.spyOn(DateValue, 'create__')`.
   *
   * @param date - The wrapped date.
   * @param showTime - Whether the time of day is part of the value.
   * @returns The new date value.
   */
  public static create__(date: Date, showTime?: boolean): DateValue {
    return new DateValue(date, showTime);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `DateValue` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `DateValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: DateValueOriginal): DateValue {
    return strictProxy(value, DateValue);
  }

  /**
   * Parses a date value from an ISO 8601 date or date-time string, such as `2025-12-31` or `2025-12-31T23:59`.
   * The mock parses with the `Date` constructor and never marks the result as showing the time.
   *
   * @param input - The string to parse.
   * @returns The parsed value, or `null` when the string is not a valid date.
   */
  public static parseFromString(input: string): DateValue | null {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : DateValue.create__(date);
  }

  /**
   * Mock-only: views this mock as Obsidian's `DateValue` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `DateValue`.
   */
  public asOriginalType3__(): DateValueOriginal {
    return strictProxy<DateValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(DateValue.prototype, 'constructor3__')`.
   *
   * @param _date - The date the value was created with.
   * @param _showTime - Whether the value was created showing the time.
   */
  public constructor3__(_date: unknown, _showTime?: boolean): void {
    noop();
  }

  /**
   * Drops the time portion of this value.
   *
   * @returns A new date value over the same `Date` that no longer shows the time. The mock does not zero the
   * underlying time.
   */
  public dateOnly(): DateValue {
    return DateValue.create__(this.date, false);
  }

  /**
   * Checks whether the value counts as true in a Bases formula.
   *
   * @returns Always `true`: a date is truthy.
   */
  public isTruthy(): boolean {
    return true;
  }

  /**
   * Describes the date relative to now.
   *
   * @returns Moment's `fromNow` text, such as `3 days ago`.
   */
  public relative(): string {
    return moment(this.date).fromNow();
  }

  /**
   * Formats the date as `YYYY-MM-DD`, followed by `THH:mm:ss` when the value shows the time.
   *
   * @returns The formatted date, in local time. The mock writes the month as `Date.getMonth` returns it, zero-based,
   * so January is `00`.
   */
  public toString(): string {
    const YEAR_FORMAT_LENGTH = 4;
    const MONTH_FORMAT_LENGTH = 2;
    const DAY_FORMAT_LENGTH = 2;
    const HOUR_FORMAT_LENGTH = 2;
    const MINUTE_FORMAT_LENGTH = 2;
    const SECOND_FORMAT_LENGTH = 2;
    let $string = `${this.date.getFullYear().toString().padStart(YEAR_FORMAT_LENGTH, '0')}-${this.date.getMonth().toString().padStart(MONTH_FORMAT_LENGTH, '0')}-${this.date.getDate().toString().padStart(DAY_FORMAT_LENGTH, '0')}`;
    if (this.showTime) {
      $string += `T${this.date.getHours().toString().padStart(HOUR_FORMAT_LENGTH, '0')}:${this.date.getMinutes().toString().padStart(MINUTE_FORMAT_LENGTH, '0')}:${this.date.getSeconds().toString().padStart(SECOND_FORMAT_LENGTH, '0')}`;
    }
    return $string;
  }
}
