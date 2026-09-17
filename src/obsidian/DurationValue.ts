/**
 * @file
 *
 * Mock of Obsidian's `DurationValue`, the Bases value wrapping a duration.
 */

import type {
  DateValue as DateValueOriginal,
  DurationValue as DurationValueOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { NotNullValue } from './NotNullValue.ts';

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const MILLISECONDS_IN_MINUTE = MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE;
const MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * MINUTES_IN_HOUR;
const MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * HOURS_IN_DAY;
const MILLISECONDS_IN_MONTH = MILLISECONDS_IN_DAY * DAYS_IN_MONTH;
const MILLISECONDS_IN_YEAR = MILLISECONDS_IN_DAY * DAYS_IN_YEAR;

type DurationComponent = 'days' | 'hours' | 'minutes' | 'months' | 'seconds' | 'years';

/**
 * Maps each unit token accepted by {@link DurationValue.parseFromString} to the
 * duration component it fills. Mirrors obsidian's parser: single units only, with
 * `mo`/`ms`/`hr`/`yr`/`min`/`sec` intentionally absent. Weeks fill `days` (×7).
 */
const DURATION_UNIT_COMPONENTS: Record<string, DurationComponent> = {
  d: 'days',
  day: 'days',
  days: 'days',
  h: 'hours',
  hour: 'hours',
  hours: 'hours',
  m: 'minutes',
  minute: 'minutes',
  minutes: 'minutes',
  month: 'months',
  months: 'months',
  s: 'seconds',
  second: 'seconds',
  seconds: 'seconds',
  w: 'days',
  week: 'days',
  weeks: 'days',
  y: 'years',
  year: 'years',
  years: 'years'
};

const WEEK_UNITS = new Set(['w', 'week', 'weeks']);

/**
 * Mock of Obsidian's `DurationValue`, a Bases `Value` wrapping a duration, which can shift a `DateValue` or result
 * from subtracting one date from another.
 *
 * The mock keeps the duration's components and converts them to milliseconds with fixed 30-day months and 365-day
 * years. It does not do date arithmetic or formatting.
 */
export class DurationValue extends NotNullValue {
  /**
   * Creates a duration from its components.
   *
   * @param years - The number of years.
   * @param months - The number of months.
   * @param days - The number of days.
   * @param hours - The number of hours.
   * @param minutes - The number of minutes.
   * @param seconds - The number of seconds.
   * @param milliseconds - The number of milliseconds.
   */
  public constructor(
    private readonly years: number,
    private readonly months: number,
    private readonly days: number,
    private readonly hours: number,
    private readonly minutes: number,
    private readonly seconds: number,
    private readonly milliseconds: number
  ) {
    super();
    const self = strictProxy(this);
    self.constructor3__(years, months, days, hours, minutes, seconds, milliseconds);
    return self;
  }

  /**
   * Mock-only factory: creates a duration, spyable via `vi.spyOn(DurationValue, 'create__')`.
   *
   * @param years - The number of years.
   * @param months - The number of months.
   * @param days - The number of days.
   * @param hours - The number of hours.
   * @param minutes - The number of minutes.
   * @param seconds - The number of seconds.
   * @param milliseconds - The number of milliseconds.
   * @returns The new duration.
   */
  public static create__(
    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
  ): DurationValue {
    return new DurationValue(years, months, days, hours, minutes, seconds, milliseconds);
  }

  /**
   * Creates a duration from a number of milliseconds.
   *
   * @param milliseconds - The length of the duration.
   * @returns A duration whose only non-zero component is its milliseconds.
   */
  public static fromMilliseconds(milliseconds: number): DurationValue {
    return DurationValue.create__(0, 0, 0, 0, 0, 0, milliseconds);
  }

  /**
   * Mock-only: views a value typed as Obsidian's `DurationValue` as this mock. The numbered subclass variant of
   * `fromOriginalType__`.
   *
   * @param value - The value typed as the original `DurationValue`.
   * @returns The same object, typed as the mock.
   */
  public static fromOriginalType3__(value: DurationValueOriginal): DurationValue {
    return strictProxy(value, DurationValue);
  }

  /**
   * Parses a duration from a string. Obsidian documents ISO 8601 durations; the mock accepts a single signed
   * integer and unit, such as `3 days`, `-2h` or `1 week` (weeks become seven days).
   *
   * @param input - The string to parse; surrounding whitespace is ignored.
   * @returns The parsed duration, or `null` when the string or its unit is not recognized.
   */
  public static parseFromString(input: string): DurationValue | null {
    const groups = /^(?<value>-?\d+)\s*(?<unit>[a-z]+)$/.exec(input.trim())?.groups;
    if (!groups) {
      return null;
    }
    const unit = ensureNonNullable(groups['unit']);
    const component = DURATION_UNIT_COMPONENTS[unit];
    if (!component) {
      return null;
    }
    let value = Number(ensureNonNullable(groups['value']));
    if (WEEK_UNITS.has(unit)) {
      value *= DAYS_IN_WEEK;
    }
    /*
     * The computed key has to come LAST: it names one of the six literal keys before it, so hoisting it to the
     * front — as `unicorn/no-immediate-mutation`'s fixer does — lets the `0` that follows overwrite the parsed
     * value. `perfectionist/sort-objects` cannot see that dependency and would sort it back into place.
     */
    // eslint-disable-next-line perfectionist/sort-objects -- See the note above: the computed key must stay last.
    const components = { days: 0, hours: 0, minutes: 0, months: 0, seconds: 0, years: 0, [component]: value };
    return DurationValue.create__(components.years, components.months, components.days, components.hours, components.minutes, components.seconds, 0);
  }

  /**
   * Shifts a date by this duration. The mock does no date arithmetic.
   *
   * @param value - The date to shift.
   * @param _subtract - Whether to subtract the duration instead of adding it.
   * @returns The given date, unchanged.
   */
  public addToDate(value: DateValueOriginal, _subtract?: boolean): DateValueOriginal {
    return value;
  }

  /**
   * Mock-only: views this mock as Obsidian's `DurationValue` type. The numbered subclass variant of
   * `asOriginalType__`.
   *
   * @returns The same object, typed as the original `DurationValue`.
   */
  public asOriginalType3__(): DurationValueOriginal {
    return strictProxy<DurationValueOriginal>(this);
  }

  /**
   * Mock-only construction hook, called at the end of the constructor; a no-op meant for
   * `vi.spyOn(DurationValue.prototype, 'constructor3__')`.
   *
   * @param _years - The years the duration was created with.
   * @param _months - The months the duration was created with.
   * @param _days - The days the duration was created with.
   * @param _hours - The hours the duration was created with.
   * @param _minutes - The minutes the duration was created with.
   * @param _seconds - The seconds the duration was created with.
   * @param _milliseconds - The milliseconds the duration was created with.
   */
  public constructor3__(
    _years: number,
    _months: number,
    _days: number,
    _hours: number,
    _minutes: number,
    _seconds: number,
    _milliseconds: number
  ): void {
    noop();
  }

  /**
   * Converts this duration to milliseconds.
   *
   * @returns The total length in milliseconds, counting a month as 30 days and a year as 365 days.
   */
  public getMilliseconds(): number {
    return this.milliseconds
      + this.seconds * MILLISECONDS_IN_SECOND
      + this.minutes * MILLISECONDS_IN_MINUTE
      + this.hours * MILLISECONDS_IN_HOUR
      + this.days * MILLISECONDS_IN_DAY
      + this.months * MILLISECONDS_IN_MONTH
      + this.years * MILLISECONDS_IN_YEAR;
  }

  /**
   * Checks whether the value counts as true in a Bases formula.
   *
   * @returns Always `true`, even for a zero-length duration.
   */
  public isTruthy(): boolean {
    return true;
  }

  /**
   * Formats the duration as text. Not implemented in the mock.
   *
   * @returns Always `''`.
   */
  public toString(): string {
    return '';
  }
}
