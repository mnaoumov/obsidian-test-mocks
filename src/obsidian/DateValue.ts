import type { DateValue as RealDateValue } from 'obsidian';

import type moment from 'moment';

import momentFn from 'moment';

import { strictCastTo } from '../internal/StrictMock.ts';
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
    return strictCastTo<RealDateValue>(this);
  }
}
