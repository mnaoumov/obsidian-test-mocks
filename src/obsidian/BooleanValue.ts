import type { BooleanValue as RealBooleanValue } from 'obsidian';

import { strictCastTo } from '../internal/StrictMock.ts';
import { PrimitiveValue } from './PrimitiveValue.ts';

export class BooleanValue extends PrimitiveValue<boolean> {
  public constructor(value = false) {
    super(value);
  }

  public override asReal__(): RealBooleanValue {
    return strictCastTo<RealBooleanValue>(this);
  }
}
