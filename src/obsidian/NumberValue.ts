import type { NumberValue as NumberValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  private static insideCreate__ = false;
  public constructor(value = 0) {
    super(value);
    if (new.target === NumberValue && !NumberValue.insideCreate__) {
      return NumberValue.create__(value);
    }
  }

  public static create__(value = 0): NumberValue {
    NumberValue.insideCreate__ = true;
    const instance = strictMock(new NumberValue(value));
    NumberValue.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): NumberValueOriginal {
    return castTo<NumberValueOriginal>(this);
  }
}
