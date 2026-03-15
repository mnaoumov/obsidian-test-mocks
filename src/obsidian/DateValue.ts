import type { DateValue as DateValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DateValue extends NotNullValue {
  public constructor(private readonly date: Date, private readonly showTime?: boolean) {
    super();
    const self = strictMock(this);
    self.constructor3__(date, showTime);
    return self;
  }

  public static create__(date: Date, showTime?: boolean): DateValue {
    return new DateValue(date, showTime);
  }

  public static override fromOriginalType__(value: DateValueOriginal): DateValue {
    return castTo<DateValue>(value);
  }

  public override asOriginalType__(): DateValueOriginal {
    return castTo<DateValueOriginal>(this);
  }

  public constructor3__(_date: unknown, _showTime?: boolean): void {
    noop();
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    const YEAR_FORMAT_LENGTH = 4;
    const MONTH_FORMAT_LENGTH = 2;
    const DAY_FORMAT_LENGTH = 2;
    const HOUR_FORMAT_LENGTH = 2;
    const MINUTE_FORMAT_LENGTH = 2;
    const SECOND_FORMAT_LENGTH = 2;
    let str = `${this.date.getFullYear().toString().padStart(YEAR_FORMAT_LENGTH, '0')}-${this.date.getMonth().toString().padStart(MONTH_FORMAT_LENGTH, '0')}-${
      this.date.getDate().toString().padStart(DAY_FORMAT_LENGTH, '0')
    }`;
    if (this.showTime) {
      str += `T${this.date.getHours().toString().padStart(HOUR_FORMAT_LENGTH, '0')}:${this.date.getMinutes().toString().padStart(MINUTE_FORMAT_LENGTH, '0')}:${
        this.date.getSeconds().toString().padStart(SECOND_FORMAT_LENGTH, '0')
      }`;
    }
    return str;
  }
}
