import type { IconValue as IconValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { StringValue } from './StringValue.ts';

export class IconValue extends StringValue {
  public constructor(value = '') {
    super(value);
    const self = strictMock(this);
    self.constructor5__(value);
    return self;
  }

  public static create2__(value = ''): IconValue {
    return new IconValue(value);
  }

  public static fromOriginalType5__(value: IconValueOriginal): IconValue {
    return castTo<IconValue>(value);
  }

  public asOriginalType5__(): IconValueOriginal {
    return castTo<IconValueOriginal>(this);
  }

  public constructor5__(_value: string): void {
    noop();
  }
}
