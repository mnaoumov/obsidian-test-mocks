import type moment from 'moment';
import type { DateValue as DateValueOriginal } from 'obsidian';

import momentFn from 'moment';

import { castTo } from '../internal/Cast.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DateValue extends NotNullValue {
  public value: moment.Moment;

  public constructor() {
    super();
    this.value = momentFn();
  }

  public override asOriginalType__(): DateValueOriginal {
    return castTo<DateValueOriginal>(this);
  }

  public isTruthy__(): boolean {
    return true;
  }

  public toString__(): string {
    return this.value.format();
  }
}
