import { castTo } from '../internal/Cast.ts';
import type { NumberValue as RealNumberValue } from 'obsidian';

import { PrimitiveValue } from './PrimitiveValue.ts';

export class NumberValue extends PrimitiveValue<number> {
  public constructor(value = 0) {
    super(value);
  }

  public override asReal__(): RealNumberValue {
    return castTo<RealNumberValue>(this);
  }
}
