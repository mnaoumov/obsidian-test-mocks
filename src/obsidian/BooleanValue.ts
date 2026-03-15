import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { noop } from '../internal/noop.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
    const self = strictMock(this);
    self.constructor4__(value);
    return self;
  }

  public static create__(value = false): BooleanValue {
    return new BooleanValue(value);
  }

  public static fromOriginalType4__(value: BooleanValueOriginal): BooleanValue {
    return castTo<BooleanValue>(value);
  }

  public asOriginalType4__(): BooleanValueOriginal {
    return castTo<BooleanValueOriginal>(this);
  }

  public constructor4__(_value = false): void {
    noop();
  }
}
