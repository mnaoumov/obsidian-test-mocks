/**
 * @file
 *
 * Mock of Obsidian's `DateValue`, the Bases value wrapping a date.
 */

import type { DateValue as DateValueOriginal } from 'obsidian';

import type { RenderContext } from './RenderContext.ts';
import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { StringValue } from './StringValue.ts';
import { moment } from './vars/moment.ts';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}(?::?\d{2})?)?$/;
const YEAR_FORMAT_LENGTH = 4;
const TWO_DIGITS_FORMAT_LENGTH = 2;

/**
 * Mock of Obsidian's `DateValue`, a Bases `Value` wrapping a `Date`, optionally with its time of day. The
 * icon follows that: `lucide-clock` when the value has its time, `lucide-calendar` when it does not.
 */
export class DateValue extends NotNullValue {
  /**
   * The value type's identifier, `'Date'` - Obsidian's own name for this class of value.
   */
  public static override type = 'Date';

  /**
   * Creates a value wrapping a date.
   *
   * @param date - The wrapped date.
   * @param time - Whether the time of day is part of the value, and so of {@link DateValue.toString}. Defaults to
   * `true`, as in Obsidian.
   */
  public constructor(public date: Date, public time = true) {
    super();
    this.icon = this.time ? 'lucide-clock' : 'lucide-calendar';
    const self = strictProxy(this);
    self.constructor3__(date, time);
    return self;
  }

  /**
   * Mock-only factory: creates a date value, spyable via `vi.spyOn(DateValue, 'create__')`.
   *
   * @param date - The wrapped date.
   * @param showTime - Whether the time of day is part of the value. Defaults to `true`.
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
   * Parses a date value from a string, as Obsidian does. `YYYY-MM-DD` gives a value without its time, at local
   * midnight. `YYYY-MM-DD HH:mm` or `YYYY-MM-DDTHH:mm`, with optional seconds, fraction and zone, gives a value with
   * its time. Any other string is rejected.
   *
   * @param input - The string to parse.
   * @returns The parsed value, or `null` when the string has neither shape.
   */
  public static parseFromString(input: string): DateValue | null {
    if (DATE_TIME_PATTERN.test(input)) {
      return DateValue.create__(new Date(input), true);
    }
    return DATE_ONLY_PATTERN.test(input) ? DateValue.create__(new Date(`${input}T00:00:00`), false) : null;
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
   * @returns This value when it has no time. Otherwise, a new value without its time, at local midnight of the same
   * day.
   */
  public dateOnly(): DateValue {
    return this.time ? DateValue.create__(new Date(`${this.printDate()}T00:00:00`), false) : this;
  }

  /**
   * Compares this date with another, as Obsidian does: by instant, not by how the two print.
   *
   * @param other - The date to compare with.
   * @returns Whether both show their time or both do not, AND both stand for the same instant. So two
   * values a second apart are unequal even without their time, where their printed forms agree.
   */
  public override equals(other: this): boolean {
    return this.time === other.time && this.date.getTime() === other.date.getTime();
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
   * Lists the property keys {@link DateValue.objectAccess} answers for.
   *
   * @returns The inherited keys followed by the eight date parts, whether or not the value shows its time.
   */
  public override keys(): string[] {
    return [
      ...super.keys(),
      'year',
      'month',
      'day',
      'hour',
      'minute',
      'second',
      'millisecond',
      'timestamp'
    ];
  }

  /**
   * Loosely compares this date with a value of any type, as Obsidian does.
   *
   * A `StringValue` is parsed through {@link DateValue.parseFromString} first, so `DateValue` loosely
   * equals the text it would be read back from. Unlike {@link DateValue.equals}, the two sides need not
   * agree about showing their time: when either hides it, both are compared at their {@link
   * DateValue.dateOnly}, so a timestamped value loosely equals the plain day it falls on.
   *
   * @param other - The value to compare with.
   * @returns Whether `other` is - or parses to - a date standing for the same instant, at whichever
   * precision the two share.
   */
  public override looseEquals(other: Value): boolean {
    let compared = other;
    if (compared instanceof StringValue) {
      compared = DateValue.parseFromString(compared.data) ?? compared;
    }
    if (!(compared instanceof DateValue)) {
      return false;
    }
    return this.time && compared.time
      ? this.date.getTime() === compared.date.getTime()
      : this.dateOnly().date.getTime() === compared.dateOnly().date.getTime();
  }

  /**
   * Reads a named part of the date.
   *
   * @param key - The property key, matched without regard to case.
   * @returns The part as a `NumberValue` — `month` counted from `1`, `timestamp` in milliseconds since the
   * epoch, and every other part read in local time — and otherwise whatever the base answers.
   */
  public override objectAccess(key: string): null | Value {
    switch (key.toLowerCase()) {
      case 'day': {
        return NumberValue.create__(this.date.getDate());
      }
      case 'hour': {
        return NumberValue.create__(this.date.getHours());
      }
      case 'millisecond': {
        return NumberValue.create__(this.date.getMilliseconds());
      }
      case 'minute': {
        return NumberValue.create__(this.date.getMinutes());
      }
      case 'month': {
        return NumberValue.create__(this.date.getMonth() + 1);
      }
      case 'second': {
        return NumberValue.create__(this.date.getSeconds());
      }
      case 'timestamp': {
        return NumberValue.create__(this.date.getTime());
      }
      case 'year': {
        return NumberValue.create__(this.date.getFullYear());
      }
      default: {
        return super.objectAccess(key);
      }
    }
  }

  /**
   * Formats the date part of the value.
   *
   * @returns The local date as `YYYY-MM-DD`.
   */
  public printDate(): string {
    const year = String(this.date.getFullYear()).padStart(YEAR_FORMAT_LENGTH, '0');
    return `${year}-${padTwoDigits(this.date.getMonth() + 1)}-${padTwoDigits(this.date.getDate())}`;
  }

  /**
   * Formats the time part of the value.
   *
   * @returns The local time as `HH:mm:ss`.
   */
  public printTime(): string {
    return `${padTwoDigits(this.date.getHours())}:${padTwoDigits(this.date.getMinutes())}:${padTwoDigits(this.date.getSeconds())}`;
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
   * Renders the value into an element, as Obsidian does: a DISABLED date input carrying the value, styled as
   * the app's metadata fields are.
   *
   * Whether the time is shown decides everything about it at once - the input's `type` is `datetime-local`
   * with a time and `date` without, and its `mod-datetime` / `mod-date` class follows the same flag. The
   * value it carries is {@link DateValue.toString}'s, which is exactly the format each input type expects.
   *
   * @param el - The element to render into.
   * @param _context - The rendering context; unused.
   */
  public override renderTo(el: HTMLElement, _context: RenderContext): void {
    el.createEl('input', {
      attr: {
        disabled: true,
        step: 'any'
      },
      cls: `metadata-input metadata-input-text ${this.time ? 'mod-datetime' : 'mod-date'}`,
      type: this.time ? 'datetime-local' : 'date',
      value: this.toString()
    });
  }

  /**
   * Formats the value as `YYYY-MM-DD`, followed by `THH:mm:ss` when it has its time.
   *
   * @returns The formatted date, in local time.
   */
  public toString(): string {
    return this.time ? `${this.printDate()}T${this.printTime()}` : this.printDate();
  }
}

function padTwoDigits(value: number): string {
  return String(value).padStart(TWO_DIGITS_FORMAT_LENGTH, '0');
}
