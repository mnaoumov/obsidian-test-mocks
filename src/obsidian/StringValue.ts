import { castTo } from '../internal/Cast.ts';
import type { StringValue as RealStringValue } from 'obsidian';

import { PrimitiveValue } from './PrimitiveValue.ts';

export class StringValue extends PrimitiveValue<string> {
  public constructor(value = '') {
    super(value);
  }

  public override asReal__(): RealStringValue {
    return castTo<RealStringValue>(this);
  }
}
