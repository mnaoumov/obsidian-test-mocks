import type {
  DateValue as DateValueOriginal,
  DurationValue as DurationValueOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;
const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;
const MILLISECONDS_PER_MONTH = MILLISECONDS_PER_DAY * DAYS_PER_MONTH;
const MILLISECONDS_PER_YEAR = MILLISECONDS_PER_DAY * DAYS_PER_YEAR;

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

  public static parseFromString(_input: string): DurationValue | null {
    return null;
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
      + this.seconds * MILLISECONDS_PER_SECOND
      + this.minutes * MILLISECONDS_PER_MINUTE
      + this.hours * MILLISECONDS_PER_HOUR
      + this.days * MILLISECONDS_PER_DAY
      + this.months * MILLISECONDS_PER_MONTH
      + this.years * MILLISECONDS_PER_YEAR;
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
