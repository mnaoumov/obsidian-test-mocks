import type { NumberValue as NumberValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  public constructor(value = 0) {
    super(value);
  }

  public override asOriginalType__(): NumberValueOriginal {
    return castTo<NumberValueOriginal>(this);
  }
}
