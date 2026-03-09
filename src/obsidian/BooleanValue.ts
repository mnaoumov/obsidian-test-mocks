import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
  }

  public static create__(value = false): BooleanValue {
    return strictMock(new BooleanValue(value));
  }

  public override asOriginalType__(): BooleanValueOriginal {
    return castTo<BooleanValueOriginal>(this);
  }
}
