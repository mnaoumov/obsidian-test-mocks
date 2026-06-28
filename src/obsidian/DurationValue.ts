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

export class DurationValue extends NotNullValue {
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

  public static fromMilliseconds(milliseconds: number): DurationValue {
    return DurationValue.create__(0, 0, 0, 0, 0, 0, milliseconds);
  }

  public static fromOriginalType3__(value: DurationValueOriginal): DurationValue {
    return strictProxy(value, DurationValue);
  }

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
    const components = { days: 0, hours: 0, minutes: 0, months: 0, seconds: 0, years: 0 };
    components[component] = value;
    return DurationValue.create__(components.years, components.months, components.days, components.hours, components.minutes, components.seconds, 0);
  }

  public addToDate(value: DateValueOriginal, _subtract?: boolean): DateValueOriginal {
    return value;
  }

  public asOriginalType3__(): DurationValueOriginal {
    return strictProxy<DurationValueOriginal>(this);
  }

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

  public getMilliseconds(): number {
    return this.milliseconds
      + this.seconds * MILLISECONDS_IN_SECOND
      + this.minutes * MILLISECONDS_IN_MINUTE
      + this.hours * MILLISECONDS_IN_HOUR
      + this.days * MILLISECONDS_IN_DAY
      + this.months * MILLISECONDS_IN_MONTH
      + this.years * MILLISECONDS_IN_YEAR;
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
