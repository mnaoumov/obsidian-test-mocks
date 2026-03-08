import { castTo } from '../internal/Cast.ts';
import type { BooleanValue as RealBooleanValue } from 'obsidian';

import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
  }

  public override asReal__(): RealBooleanValue {
    return castTo<RealBooleanValue>(this);
  }
}
