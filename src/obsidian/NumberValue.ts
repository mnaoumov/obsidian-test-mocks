import type { NumberValue as NumberValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  public constructor(value = 0) {
    super(value);
    const self = strictMock(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = 0): NumberValue {
    return new NumberValue(value);
  }

  public static fromOriginalType4__(value: NumberValueOriginal): NumberValue {
    return castTo<NumberValue>(value);
  }

  public asOriginalType4__(): NumberValueOriginal {
    return castTo<NumberValueOriginal>(this);
  }

  public constructor4__(_value = 0): void {
    noop();
  }
}
