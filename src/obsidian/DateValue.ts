import type moment from 'moment';

import { NotNullValue } from './NotNullValue.ts';

export class DateValue extends NotNullValue {
  public value!: moment.Moment;

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return this.value.format();
  }
}
