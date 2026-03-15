import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { NotNullValue } from './NotNullValue.ts';

export class RegExpValue extends NotNullValue {
  public constructor(regexp: RegExp) {
    super();
    const self = strictMock(this);
    self.constructor3__(regexp);
    return self;
  }

  public static create__(regexp: RegExp): RegExpValue {
    return new RegExpValue(regexp);
  }

  public static fromOriginalType3__(value: RegExpValueOriginal): RegExpValue {
    return castTo<RegExpValue>(value);
  }

  public asOriginalType3__(): RegExpValueOriginal {
    return castTo<RegExpValueOriginal>(this);
  }

  public constructor3__(_regexp: RegExp): void {
    noop();
  }

  public isTruthy(): boolean {
    return true;
  }

  public toString(): string {
    return '';
  }
}
