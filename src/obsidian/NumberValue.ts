import type { NumberValue as NumberValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  public constructor(value = 0) {
    super(value);
  }

  public static create__(value = 0): NumberValue {
    return strictMock(new NumberValue(value));
  }

  public override asOriginalType__(): NumberValueOriginal {
    return castTo<NumberValueOriginal>(this);
  }
}
