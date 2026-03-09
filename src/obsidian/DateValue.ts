import type moment from 'moment';
import type { DateValue as DateValueOriginal } from 'obsidian';

import momentFn from 'moment';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DateValue extends NotNullValue {
  public value__: moment.Moment;

  public constructor() {
    super();
    this.value__ = momentFn();
  }

  public static create__(): DateValue {
    return strictMock(new DateValue());
  }

  public override asOriginalType__(): DateValueOriginal {
    return castTo<DateValueOriginal>(this);
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return this.value__.format();
  }
}
