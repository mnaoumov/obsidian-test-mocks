import type { RelativeDateValue as RelativeDateValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import {
  mergePrototype,
  strictProxyForce
} from '../internal/strict-proxy.ts';
import { DateValue } from './DateValue.ts';

export class RelativeDateValue extends DateValue {
  public constructor(date: Date, showTime?: boolean) {
    super(date, showTime);
    const self = strictProxyForce(this);
    self.constructor4__(date, showTime);
    return self;
  }

  public static create2__(date: Date, showTime?: boolean): RelativeDateValue {
    return new RelativeDateValue(date, showTime);
  }

  public static fromOriginalType4__(value: RelativeDateValueOriginal): RelativeDateValue {
    return mergePrototype(RelativeDateValue, value);
  }

  public asOriginalType4__(): RelativeDateValueOriginal {
    return strictProxyForce<RelativeDateValueOriginal>(this);
  }

  public constructor4__(_date: unknown, _showTime?: boolean): void {
    noop();
  }
}
