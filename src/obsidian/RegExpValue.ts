import type { RegExpValue as RegExpValueOriginal } from 'obsidian';

import { noop } from '../internal/noop.ts';
import { strictProxyForce } from '../internal/strict-proxy.ts';
import { NotNullValue } from './NotNullValue.ts';

export class RegExpValue extends NotNullValue {
  public constructor(regexp: RegExp) {
    super();
    const self = strictProxyForce(this);
    self.constructor3__(regexp);
    return self;
  }

  public static create__(regexp: RegExp): RegExpValue {
    return new RegExpValue(regexp);
  }

  public static fromOriginalType3__(value: RegExpValueOriginal): RegExpValue {
    return strictProxyForce(value, RegExpValue);
  }

  public asOriginalType3__(): RegExpValueOriginal {
    return strictProxyForce<RegExpValueOriginal>(this);
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
