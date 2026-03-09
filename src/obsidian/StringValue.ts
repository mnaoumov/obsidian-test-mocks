import type { StringValue as StringValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
    this.constructor__(value);
  }

  public static create__(value = ''): StringValue {
    return strictMock(new StringValue(value));
  }

  public override asOriginalType__(): StringValueOriginal {
    return castTo<StringValueOriginal>(this);
  }

  public constructor__(_value = ''): void {
    noop();
  }
}
