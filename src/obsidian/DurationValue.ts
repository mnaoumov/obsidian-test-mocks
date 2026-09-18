/**
 * @file
 *
 * Mock of Obsidian's `DurationValue`, the Bases value wrapping a duration.
 */

import type {
  DateValue as DateValueOriginal,
  DurationValue as DurationValueOriginal
} from 'obsidian';

import type { Value } from './Value.ts';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { ensureNonNullable } from '../internal/type-guards.ts';
import { DateValue } from './DateValue.ts';
import { NotNullValue } from './NotNullValue.ts';
import { NumberValue } from './NumberValue.ts';
import { StringValue } from './StringValue.ts';
import { moment } from './vars/moment.ts';

const DAYS_IN_WEEK = 7;

type DurationUnit = 'days' | 'hours' | 'milliseconds' | 'minutes' | 'months' | 'seconds' | 'weeks' | 'years';

/**
 * The units {@link DurationValue.objectAccess} answers for, keyed by their lower-cased name.
 */
const DURATION_UNITS: Record<string, DurationUnit> = {
  days: 'days',
  hours: 'hours',
  milliseconds: 'milliseconds',
  minutes: 'minutes',
  months: 'months',
  seconds: 'seconds',
  weeks: 'weeks',
  years: 'years'
};

/**
 * Obsidian's ISO 8601 duration pattern. It is deliberately a verbatim copy: it is unanchored, and its `T` is
 * mandatory, so `P3D` does not match it and falls through to {@link SINGLE_UNIT_PATTERN}.
 */
const ISO_DURATION_PATTERN = /P(?:(?<years>[.,\d]+)Y)?(?:(?<months>[.,\d]+)M)?(?:(?<weeks>[.,\d]+)W)?(?:(?<days>[.,\d]+)D)?T(?:(?<hours>[.,\d]+)H)?(?:(?<minutes>[.,\d]+)M)?(?:(?<seconds>[.,\d]+)S)?/;

/**
 * Obsidian's single-unit pattern, such as `3 days`, `-2h` or `1M`: `M` is months and `m` is minutes.
 */
const SINGLE_UNIT_PATTERN = /^(?<amount>-?\d+) ?(?<unit>[dhm]|[swy]|M|(?:second|minute|hour|day|week|month|year)s?)$/;

type DurationComponents = [years: number, months: number, days: number, hours: number, minutes: number, seconds: number];

/**
 * Mock of Obsidian's `DurationValue`, a Bases `Value` wrapping a duration, which can shift a `DateValue` or result
 * from subtracting one date from another.
 */
export class DurationValue extends NotNullValue {
  /**
   * The lucide icon name standing for this value's type.
   */
  public override icon = 'lucide-calendar-range';

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
    public years: number,
    public months: number,
    public days: number,
    public hours: number,
    public minutes: number,
    public seconds: number,
    public milliseconds: number
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
   * Parses a duration from a string, as Obsidian does.
   *
   * It first searches the string for an ISO 8601 duration with a time part, such as `P1Y2M3DT4H5M6S` or `PT0S`. The
   * search is unanchored, and a duration without `T`, such as `P3D`, does not match. Weeks add seven days each.
   * Failing that, the whole string must be one signed integer and unit, with at most one space between them:
   * `3 days`, `-2h`, `1 week`. The units are `s`, `m` (minutes), `h`, `d`, `w`, `M` (months) and `y`, or the words
   * `second`, `minute`, `hour`, `day`, `week`, `month` and `year`, singular or plural.
   *
   * @param input - The string to parse.
   * @returns The parsed duration, or `null` when the string has neither shape.
   */
  public static parseFromString(input: string): DurationValue | null {
    const isoGroups = ISO_DURATION_PATTERN.exec(input)?.groups;
    if (isoGroups) {
      return DurationValue.create__(
        parseIsoPart(isoGroups['years']),
        parseIsoPart(isoGroups['months']),
        DAYS_IN_WEEK * parseIsoPart(isoGroups['weeks']) + parseIsoPart(isoGroups['days']),
        parseIsoPart(isoGroups['hours']),
        parseIsoPart(isoGroups['minutes']),
        parseIsoPart(isoGroups['seconds']),
        0
      );
    }

    const groups = SINGLE_UNIT_PATTERN.exec(input)?.groups;
    if (!groups) {
      return null;
    }
    const amount = Number.parseFloat(ensureNonNullable(groups['amount']));
    const components = getSingleUnitComponents(ensureNonNullable(groups['unit']), amount);
    return DurationValue.create__(...components, 0);
  }

  /**
   * Shifts a date by this duration, one calendar component at a time: years, months, days, then hours, minutes,
   * seconds and milliseconds.
   *
   * @param value - The date to shift.
   * @param subtract - Whether to subtract the duration instead of adding it.
   * @returns A new date value. It has its time when `value` has, or when any of this duration's hours, minutes,
   * seconds or milliseconds is non-zero.
   */
  public addToDate(value: DateValueOriginal, subtract?: boolean): DateValueOriginal {
    const sign = subtract ? -1 : 1;
    const source = DateValue.fromOriginalType3__(value);
    const date = new Date(source.date);
    let hasTime = source.time;
    if (this.years !== 0) {
      date.setFullYear(date.getFullYear() + sign * this.years);
    }
    if (this.months !== 0) {
      date.setMonth(date.getMonth() + sign * this.months);
    }
    if (this.days !== 0) {
      date.setDate(date.getDate() + sign * this.days);
    }
    if (this.hours !== 0) {
      date.setHours(date.getHours() + sign * this.hours);
      hasTime = true;
    }
    if (this.minutes !== 0) {
      date.setMinutes(date.getMinutes() + sign * this.minutes);
      hasTime = true;
    }
    if (this.seconds !== 0) {
      date.setSeconds(date.getSeconds() + sign * this.seconds);
      hasTime = true;
    }
    if (this.milliseconds !== 0) {
      date.setMilliseconds(date.getMilliseconds() + sign * this.milliseconds);
      hasTime = true;
    }
    return DateValue.create__(date, hasTime).asOriginalType3__();
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
   * Compares this duration with another, as Obsidian does: field by field, rather than by how the two
   * print.
   *
   * It is deliberately NOT a comparison of length: `7 days` and `1 week` are stored as different fields —
   * a week parses to seven days, but a month never becomes days — so two durations of the same length in
   * different units are unequal here and loosely equal through {@link DurationValue.looseEquals}.
   *
   * @param other - The duration to compare with.
   * @returns Whether all seven components match.
   */
  public override equals(other: this): boolean {
    return this.years === other.years
      && this.months === other.months
      && this.days === other.days
      && this.hours === other.hours
      && this.minutes === other.minutes
      && this.seconds === other.seconds
      && this.milliseconds === other.milliseconds;
  }

  /**
   * Converts this duration to milliseconds, as Obsidian does: by adding it to the current date and measuring the
   * difference. Months and years therefore have their calendar length from now, and the result depends on the
   * current date (and the local time zone's daylight-saving shifts).
   *
   * @returns The length of the duration in milliseconds, measured from now.
   */
  public getMilliseconds(): number {
    const now = DateValue.create__(new Date());
    return DateValue.fromOriginalType3__(this.addToDate(now.asOriginalType3__())).date.getTime() - now.date.getTime();
  }

  /**
   * Checks whether the value counts as true in a Bases formula.
   *
   * @returns Whether any component of the duration is non-zero.
   */
  public isTruthy(): boolean {
    return this.years !== 0
      || this.months !== 0
      || this.days !== 0
      || this.hours !== 0
      || this.minutes !== 0
      || this.seconds !== 0
      || this.milliseconds !== 0;
  }

  /**
   * Lists the property keys {@link DurationValue.objectAccess} answers for.
   *
   * @returns The inherited keys followed by the eight units, in Obsidian's own order.
   */
  public override keys(): string[] {
    return [
      ...super.keys(),
      'years',
      'months',
      'days',
      'weeks',
      'hours',
      'minutes',
      'seconds',
      'milliseconds'
    ];
  }

  /**
   * Loosely compares this duration with a value of any type, as Obsidian does: by LENGTH rather than by
   * components, so `1 week` loosely equals `7 days` where {@link DurationValue.equals} separates them.
   *
   * A `StringValue` is parsed through {@link DurationValue.parseFromString} first, so a duration loosely
   * equals the text it would be read back from. The length is {@link DurationValue.getMilliseconds},
   * which Obsidian measures FROM NOW, so a comparison involving months or years depends on the current
   * date.
   *
   * @param other - The value to compare with.
   * @returns Whether `other` is - or parses to - a duration of the same length.
   */
  public override looseEquals(other: Value): boolean {
    let compared = other;
    if (compared instanceof StringValue) {
      compared = DurationValue.parseFromString(compared.data) ?? compared;
    }
    return compared instanceof DurationValue && this.getMilliseconds() === compared.getMilliseconds();
  }

  /**
   * Measures the duration in a named unit.
   *
   * @param key - The unit name, matched without regard to case.
   * @returns The duration as a `NumberValue` in that unit, and otherwise whatever the base answers. It is
   * measured as Obsidian measures it — by shifting the current date by this duration and taking moment's
   * fractional difference — so a duration in months or years has its calendar length FROM NOW, and the
   * answer depends on the current date and the local time zone's daylight-saving shifts.
   */
  public override objectAccess(key: string): null | Value {
    const unit = DURATION_UNITS[key.toLowerCase()];
    if (unit === undefined) {
      return super.objectAccess(key);
    }
    const now = DateValue.create__(new Date());
    const shifted = DateValue.fromOriginalType3__(this.addToDate(now.asOriginalType3__()));
    return NumberValue.create__(moment(shifted.date).diff(now.date, unit, true));
  }

  /**
   * Formats the duration as text.
   *
   * @returns Moment's humanized text for the duration's components, such as `3 days` or `a few seconds`.
   */
  public toString(): string {
    return moment.duration({
      days: this.days,
      hours: this.hours,
      milliseconds: this.milliseconds,
      minutes: this.minutes,
      months: this.months,
      seconds: this.seconds,
      years: this.years
    }).humanize();
  }
}

function getSingleUnitComponents(unit: string, amount: number): DurationComponents {
  switch (unit) {
    case 'd':
    case 'day':
    case 'days': {
      return [0, 0, amount, 0, 0, 0];
    }
    case 'h':
    case 'hour':
    case 'hours': {
      return [0, 0, 0, amount, 0, 0];
    }
    case 'M':
    case 'month':
    case 'months': {
      return [0, amount, 0, 0, 0, 0];
    }
    case 'm':
    case 'minute':
    case 'minutes': {
      return [0, 0, 0, 0, amount, 0];
    }
    case 'w':
    case 'week':
    case 'weeks': {
      return [0, 0, DAYS_IN_WEEK * amount, 0, 0, 0];
    }
    case 'y':
    case 'year':
    case 'years': {
      return [amount, 0, 0, 0, 0, 0];
    }
    default: {
      return [0, 0, 0, 0, 0, amount];
    }
  }
}

function parseIsoPart(part: string | undefined): number {
  return part === undefined ? 0 : Number.parseInt(part, 10);
}
