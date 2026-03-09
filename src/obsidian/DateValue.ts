import type moment from 'moment';
import type { DateValue as DateValueOriginal } from 'obsidian';

import momentFn from 'moment';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class DateValue extends NotNullValue {
  private static insideCreate__ = false;
  public value__: moment.Moment;

  public constructor() {
    super();
    this.value__ = momentFn();
    if (new.target === DateValue && !DateValue.insideCreate__) {
      return DateValue.create__();
    }
  }

  public static create__(): DateValue {
    DateValue.insideCreate__ = true;
    const instance = strictMock(new DateValue());
    DateValue.insideCreate__ = false;
    return instance;
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
