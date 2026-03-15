import type { HTMLValue as HTMLValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class HTMLValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): HTMLValue {
    return new HTMLValue(value);
  }

  public static fromOriginalType3__(value: HTMLValueOriginal): HTMLValue {
    return castTo<HTMLValue>(value);
  }

  public override asOriginalType__(): HTMLValueOriginal {
    return castTo<HTMLValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}
