import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { strictMock } from '../internal/strict-mock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  private static insideCreate__ = false;
  public constructor(value = false) {
    super(value);
    if (new.target === BooleanValue && !BooleanValue.insideCreate__) {
      return BooleanValue.create__(value);
    }
  }

  public static create__(value = false): BooleanValue {
    BooleanValue.insideCreate__ = true;
    const instance = strictMock(new BooleanValue(value));
    BooleanValue.insideCreate__ = false;
    return instance;
  }

  public override asOriginalType__(): BooleanValueOriginal {
    return castTo<BooleanValueOriginal>(this);
  }
}
