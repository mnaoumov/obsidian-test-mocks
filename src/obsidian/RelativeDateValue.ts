import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxy } from '../internal/strict-proxy.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  public constructor(date: Date, showTime?: boolean) {
    super(date, showTime);
    const self = strictProxy(this);
    self.constructor4__(date, showTime);
    return self;
  }

  public static create2__(date: Date, showTime?: boolean): RelativeDateValue {
    return new RelativeDateValue(date, showTime);
  }

  public static fromOriginalType4__(value: RelativeDateValueOriginal): RelativeDateValue {
    return strictProxy(value, RelativeDateValue);
  }

  public asOriginalType4__(): RelativeDateValueOriginal {
    return strictProxy<RelativeDateValueOriginal>(this);
  }

  public constructor4__(_date: unknown, _showTime?: boolean): void {
    noop();
  }
}
