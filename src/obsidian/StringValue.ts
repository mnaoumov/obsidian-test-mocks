import type { StringValue as StringValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
  }

  public static create__(value = ''): StringValue {
    return strictMock(new StringValue(value));
  }

  public override asOriginalType__(): StringValueOriginal {
    return castTo<StringValueOriginal>(this);
  }
}
