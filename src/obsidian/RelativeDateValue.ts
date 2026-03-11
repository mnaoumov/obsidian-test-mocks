import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  public constructor(date: unknown, showTime?: boolean) {
    super(date, showTime);
    const self = strictMock(this);
    self.constructor4__(date, showTime);
    return self;
  }

  public static create2__(date: unknown, showTime?: boolean): RelativeDateValue {
    return new RelativeDateValue(date, showTime);
  }

  public override asOriginalType__(): RelativeDateValueOriginal {
    return castTo<RelativeDateValueOriginal>(this);
  }

  public constructor4__(_date: unknown, _showTime?: boolean): void {
    noop();
  }
}
