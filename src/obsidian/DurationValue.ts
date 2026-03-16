import type { DurationValue as DurationValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DurationValue extends NotNullValue {
  public constructor(
    years: number,
    months: number,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
  ) {
    super();
    const self = createMockOfUnsafe(this);
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

  public static fromOriginalType3__(value: DurationValueOriginal): DurationValue {
    return createMockOfUnsafe<DurationValue>(value);
  }

  public asOriginalType3__(): DurationValueOriginal {
    return createMockOfUnsafe<DurationValueOriginal>(this);
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

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
