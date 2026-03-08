import { castTo } from '../internal/Cast.ts';
import type { DateValue as RealDateValue } from 'obsidian';

import type moment from 'moment';

import momentFn from 'moment';

import { NotNullValue } from './NotNullValue.ts';

export class DateValue extends NotNullValue {
  public value: moment.Moment;

  public constructor() {
    super();
    this.value = momentFn();
  }

  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return this.value.format();
  }

  public override asReal__(): RealDateValue {
    return castTo<RealDateValue>(this);
  }
}
