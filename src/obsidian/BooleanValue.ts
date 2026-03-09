import type { BooleanValue as BooleanValueOriginal } from 'obsidian';

import { castTo } from '../internal/cast.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
  }

  public override asOriginalType__(): BooleanValueOriginal {
    return castTo<BooleanValueOriginal>(this);
  }
}
