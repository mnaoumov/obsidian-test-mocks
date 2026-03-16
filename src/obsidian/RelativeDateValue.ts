import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { createMockOfUnsafe } from '../internal/create-mock-of.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  public constructor(date: Date, showTime?: boolean) {
    super(date, showTime);
    const self = strictMock(this);
    self.constructor4__(date, showTime);
    return self;
  }

  public static create2__(date: Date, showTime?: boolean): RelativeDateValue {
    return new RelativeDateValue(date, showTime);
  }

  public static fromOriginalType4__(value: RelativeDateValueOriginal): RelativeDateValue {
    return createMockOfUnsafe<RelativeDateValue>(value);
  }

  public asOriginalType4__(): RelativeDateValueOriginal {
    return createMockOfUnsafe<RelativeDateValueOriginal>(this);
  }

  public constructor4__(_date: unknown, _showTime?: boolean): void {
    noop();
  }
}
