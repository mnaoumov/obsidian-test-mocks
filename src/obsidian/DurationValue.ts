import type {
  DateValue as DateValueOriginal,
  DurationValue as DurationValueOriginal
} from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_MONTH = 30;
const DAYS_IN_YEAR = 365;
const MILLISECONDS_IN_MINUTE = MILLISECONDS_IN_SECOND * SECONDS_IN_MINUTE;
const MILLISECONDS_IN_HOUR = MILLISECONDS_IN_MINUTE * MINUTES_IN_HOUR;
const MILLISECONDS_IN_DAY = MILLISECONDS_IN_HOUR * HOURS_IN_DAY;
const MILLISECONDS_IN_MONTH = MILLISECONDS_IN_DAY * DAYS_IN_MONTH;
const MILLISECONDS_IN_YEAR = MILLISECONDS_IN_DAY * DAYS_IN_YEAR;

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
