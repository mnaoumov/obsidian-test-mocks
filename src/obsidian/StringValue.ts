import type { StringValue as StringValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  private static insideCreate__ = false;
  public constructor(value = '') {
    super(value);
    if (new.target === StringValue && !StringValue.insideCreate__) {
      return StringValue.create__(value);
    }
  }

  public static create__(value = ''): StringValue {
    StringValue.insideCreate__ = true;
    const instance = strictMock(new StringValue(value));
    StringValue.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): StringValueOriginal {
    return castTo<StringValueOriginal>(this);
  }
}
